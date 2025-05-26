import React, { useState } from "react";
import Select, { createFilter } from "react-select";
import "./formInputs.scss";
import AsyncSelect from 'react-select/async';
import LoaderCustom from "../common/LoaderCustom";
import { SPACEBAR } from "../../config/constants";
import DatePicker, { ReactDatePicker } from 'react-datepicker'
import Popup from "reactjs-popup";
import { validateSpecialChars, validateSpecialCharsForRemarks } from "../../helper";
import { MESSAGES } from "../../config/message";
import {  Col } from "reactstrap";
import Button from "../layout/Button";
import $ from "jquery"

export const TextFieldHooks = (input) => {

  const { register, rules, name, label, mandatory, errors, disabled, value, ...inputProps } = input;
  const isDisabled = disabled === true ? true : false;
  const className = `form-group inputbox ${input.customClassName ? input.customClassName : ""}`;
  const InputClassName = `form-control ${input.className ? input.className : ""}`;
  const combinedRules = {
    ...rules,
    validate: {
      ...rules?.validate,
      specialCharCheck: (value) => isDisabled ? () => { } : validateSpecialChars(value),
    },
  };
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
          rules={combinedRules}
          {...inputProps}
          autoComplete={'off'}
        />
        {errors && (errors?.message || errors?.type) ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ""}
      </div>
    </>
  )
}

const errorFunc = (errors, field) => {
  switch (errors?.type) {
    case "maxLength":
      return <div className="text-help">{field?.rules?.maxLength?.message ?? `Maximum length is ${field?.rules?.maxLength}`}</div>

    case "required":
      return <div className="text-help">This field is required</div>

    default:
      return <div className={`${field?.disableErrorOverflow ? '' : "text-error-title"}`}><div className="text-help">{(errors?.message || errors?.type)}</div>
        {!field?.disableErrorOverflow && <div className="error-overflow">{(errors?.message || errors?.type)}</div>} </div>
  }
}

export const TextFieldHookForm = (field) => {
  const { label, Controller, placeholder, control, register, name, defaultValue, mandatory, errors, rules, handleChange, hidden, isLoading, disableErrorOverflow, id } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${hidden ? 'd-none' : ''}`;
  const InputClassName = `form-control ${field.className ? field.className : ""}`;
  const isDisabled = field.disabled === true ? true : false;
  let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  let loaderClass = isLoading && isLoading?.isLoader ? isLoading?.loaderClass !== undefined ? isLoading?.loaderClass : '' : '';
  let containerId = `${name}_container`;

  const combinedRules = {
    ...rules,
    validate: {
      ...rules?.validate,
      specialCharCheck: (value) => isDisabled ? () => { } : validateSpecialChars(value),
    },
  };
  return (
    <>
      <div className={className}>
        {
          !hidden &&
          <label className={label === false ? 'd-none' : ''}>
            {label}
            {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
          </label>
        }
        <div id={id ? id : containerId}>
          <Controller
            name={name}
            control={control}
            rules={combinedRules}
            // ref={reg}
            {...register}
            defaultValue={defaultValue}
            hidden={hidden}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <div className={`${isLoader ? "p-relative" : ''} input-container`}>
                  <input
                    {...field}
                    id={`${name}_input`}
                    {...register}
                    title={isDisabled ? value : ''}
                    name={name}
                    className={InputClassName}
                    disabled={isDisabled}
                    placeholder={isDisabled ? '-' : placeholder || 'Enter'}
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
  const { id, label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange, hidden, isLoading, active, touched, error, input, disableErrorOverflow } = field
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
                <div className={inputbox} id={id ?? ''}>
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
        {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
          : errors && errors?.type !== 'required' ? <div className={`${disableErrorOverflow ? '' : "text-error-title"}`}><div className="text-help">{(errors?.message || errors?.type)}</div>{!disableErrorOverflow && <div className="error-overflow">{(errors?.message || errors?.type)}</div>} </div> : ''}
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
  let containerId = `${name}_container`;
  return (
    <>
      <div className={className} >
        <label>
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <div id={id ? id : containerId}>
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
                  id={name}
                  {...register}
                  title={isDisabled ? value : ''}
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


        {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
          : errors && errors?.type !== 'required' ? <div className={`${disableErrorOverflow ? '' : "text-error-title"}`}><div className="text-help">{(errors?.message || errors?.type)}</div>{!disableErrorOverflow && <div className="error-overflow">{(errors?.message || errors?.type)}</div>} </div> : ''}
      </div>
    </>
  )
}

export const SearchableSelectHookForm = (field) => {
  const { name, label, Controller, mandatory, disabled, options, handleChange, rules, placeholder, defaultValue,
    control, errors, register, isLoading, customClassName, isMulti, buttonCross, title, dropdownHeight, dropDownClass, onFocus, isClearable, id, tooltipId, menuPortalTarget, isTaxCode = false } = field;

  let isDisable = (disabled && disabled === true) ? true : false;
  let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  let isMultiple = (isMulti === true) ? true : false;
  const className = `${isLoader ? 'p-relative' : ''} ${buttonCross ? 'cross-btn-container' : ''} input-container`
  let containerId = `${name}_container`;
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
      // top: 44,
      marginRight: "5px",
      marginLeft: "5px",
      width: 'calc(100% - 10px)',
    }),
  };
  const filterConfig = {
    stringify: option => `${option.label}`,
  };

  $('body').on('click', '#costingHeadDropDown_container', function() {
    $('body').find('.multi-select-container__menu').parent().css('z-index', '9999')
  })
  return (
    <div className={`w-100 mb-15 form-group-searchable-select ${customClassName}`} id={id ? id : containerId}>
      <label className={label === false ? 'd-none' : ''}>
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
          let updatedValue = value
          if (value) {
            if ((Object.values(value).length === 0 || value.length === 0)) {
              updatedValue = ''
            } else if (value.label === null) {
              updatedValue = ''
            }
          } else if (value === null) {
            updatedValue = ''
          }
          return (
            <div id={tooltipId ?? ''} className={className} title={title ? title : isDisable ? value?.label : ''}>
              <Select
                {...field}
                id={containerId}
                isClearable={isClearable}
                inputId={name}
                instanceId={name}
                {...register}
                name={name}
                placeholder={placeholder ? placeholder : isDisable ? '-' : 'Select'}
                isDisabled={isDisable}
                onChange={isDisable? ()=>{}:(e, action) => {
                  handleChange(e, action);
                  document.activeElement.blur();
                  onChange(e)

                }}
                classNamePrefix="multi-select-container"
                className="multidropdown-container cursor-allowed"
                menuPlacement="auto"
                styles={dropDownClass && customStyles}
                onFocus={onFocusChange}
                options={options}
                onBlur={onBlur}
                selected={value}
                value={updatedValue}
                isLoading={isLoader}
                isMulti={isMultiple}
                onKeyDown={(onKeyDown) => {
                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                }}
                filterOption={createFilter(filterConfig)}
                menuPortalTarget={menuPortalTarget ? document.body : null}
              />
              {isLoader && <LoaderCustom customClass={"input-loader"} />}
              {buttonCross && <button type="button" className={'btn-cross'} disabled={isDisable} onClick={buttonCross}>
                <div className='cross-light'></div>
              </button>}
            </div>
          )

        }}
      />

      {/* {errors && errors?.type === 'required' ? <div className="text-help">'This field is required'</div> : ""} */}
      {/* {errors && errors?.type === 'required' ? '<div className="text-help">This field is required</div>' : ""} */}
      {/*    {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
        : errors && errors?.type !== 'required' ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ''} */}
      {/* {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
        : errors && errors?.type !== 'required' ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ''} */}
      {errors !== undefined ? (errors?.type === 'required' ? (<div className="text-help">This field is required</div>) : errors?.ref?.value ? (null
      ) : errors?.message || errors?.type ? (<div className="text-help">{errors?.message || errors?.type}</div>) : null
      ) : null}








    </div>
  )
}

const errorAreaFunc = (errors, field) => {
  switch (errors?.type) {
    case "maxLength":
      return <div className="text-help">{field?.rules?.maxLength?.message ? field?.rules?.maxLength?.message : `Maximum length is ${field?.rules?.maxLength}`}</div>

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
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange, rowHeight } = field
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
  const InputClassName = `form-control text-area ${field.className ? field.className : ""}`;
  const isDisabled = field.disabled === true ? true : false;
  const validateWithRemarkValidation = field?.validateWithRemarkValidation ? true : false
  let minHeight = rowHeight ? rowHeight : 4
  let containerId = `${name}_container`;
  const combinedRules = {
    ...rules,
    validate: {
      ...rules?.validate,
      specialCharCheck: (value) => isDisabled ? () => { } : validateWithRemarkValidation ? validateSpecialCharsForRemarks(value) : validateSpecialChars(value)
    },
  };
  return (
    <>
      <div className={className} id={containerId}>
        <label>
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <Controller
          name={name}
          control={control}
          rules={combinedRules}
          {...register}
          defaultValue={defaultValue}
          render={({ field: { onChange, onBlur, value, name } }) => {
            return (
              <textarea
                {...field}
                {...register}
                title={isDisabled ? value : ''}
                id={name}
                name={name}
                className={InputClassName}
                disabled={isDisabled}
                value={value}
                autoComplete={'off'}
                rows={rowHeight && rowHeight}
                style={{ minHeight: `${minHeight * 25}px` }}
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
    label, Controller, control, register, name, defaultValue, mandatory, errors, rules, placeholder, handleChange, buttonCross, maxDate, minDate } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ''} ${buttonCross ? 'cross-btn-container' : ''}`
  const isDisabled = field.disabled === true ? true : false
  let containerId = `${name}_container`;
  return (
    <React.Fragment>
      <div className={className} id={containerId}>
        <label>
          {label} {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <div className="p-relative pr-0">
          <Controller
            name={name}
            control={control}
            rules={rules}
            {...register}
            defaultValue={defaultValue}
            render={({ field: { onChange, onBlur, value, name } }) => (

              // return (
              <DatePicker
                {...field}

                {...register}
                name={name}
                id={name}
                value={value}
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder}
                maxDate={maxDate}
                minDate={minDate}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
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
          {buttonCross && <button type="button" className={'btn-cross'} disabled={isDisabled} onClick={buttonCross}>
            <div className='cross-light'></div>
          </button>}
          {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
            : errors && errors?.type !== 'required' ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ''}
        </div>
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
// export const RadioHookForm = (field) => {
//   const { dataArray = [], label = "label", optionsValue = "optionsValue", labelElement = '', className, selectedValue = "", register, name, onChange = null, defaultValue } = field

//   const onChangeSelect = (val) => {
//     onChange && onChange(val);
//   };
//   const flexContainer = {
//   };
//   return (
//     <div className={`te-radio-button ${className}`}>
//       <div>
//         {dataArray && dataArray.length !== 0 && (
//           <ul style={flexContainer} className={"radio-button-list d-flex"}>
//             {dataArray.map((data, index) => {
//               return (
//                 <li className="p-3" key={index}>
//                   <label className="radio-button-wrapper radio-box">
//                     <input
//                       {...field}
//                       {...register}
//                       name={name}
//                       type="radio"
//                       value={data.optionsValue}
//                       defaultValue={defaultValue}
//                       checked={data.optionsValue === defaultValue ? true : false}
//                       onChange={e =>
//                         onChangeSelect(
//                           e.target.value
//                         )
//                       }
//                     />
//                     {" "}
//                     {/* {data[labelElement] && data[labelElement]} */}
//                     <span className="radio-label">{data[label]}</span>
//                   </label>
//                 </li>)
//             })
//             }
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };






export const RadioHookForm = (field) => {
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange } = field
  const className = `${field.customClassName ? field.customClassName : ""}`;
  const isDisabled = field.disabled === true ? true : false;
  let containerId = `${name}_container`;
  return (
    <>
      <div
        className={className}
        id={containerId}
      >
        <label className="label-container">
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}

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
                  type="radio"
                  id={name}
                  name={name}
                  checked={defaultValue}
                  // className={InputClassName}
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
        </label>
        {errors && (errors?.message || errors?.type) ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ""}
      </div>
    </>
  )
}


export const AsyncSearchableSelectHookForm = (field) => {
  const { name, label, Controller, mandatory, disabled, handleChange, rules, placeholder, defaultValue,
    control, errors, register, isLoading, customClassName, asyncOptions, NoOptionMessage, isMulti, buttonCross } = field;

  let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  let isLoaderClass = isLoading && isLoading?.isLoader ? isLoading?.isLoaderClass !== undefined ? isLoading?.isLoaderClass : '' : '';
  let containerId = `${name}_container`;
  return (
    <div className={`w-100 mb-15 form-group-searchable-select ${customClassName}`} id={containerId}>
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
            <div className={`input-container ${isLoader ? "p-relative" : ''} ${buttonCross ? 'cross-btn-container' : ''}`} title={disabled ? value?.label : ''}>
              <AsyncSelect
                {...field}
                {...register}
                name={name}
                id={containerId}
                inputId={name}
                placeholder={placeholder}
                isDisabled={disabled}
                onChange={(e) => {
                  handleChange(e);
                  onChange(e)
                }}
                menuPlacement="auto"
                classNamePrefix="multi-select-container"
                className="multidropdown-container"
                isMulti={isMulti}
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
              {buttonCross && <button type="button" className={'btn-cross'} disabled={disabled} onClick={buttonCross}>
                <div className='cross-light'></div>
              </button>}
            </div>
          )

        }}
      />

      {/* {errors && errors?.type === 'required' ? <div className="text-help">'This field is required'</div> : ""} */}
      {/* {errors && errors?.type === 'required' ? '<div className="text-help">This field is required</div>' : ""} */}
      {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
        : errors && errors?.type !== 'required' ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ''}

    </div>
  )
}

/*
@method: renderDatePickerHookForm
@desc: Render datePicker input
*/
export const DateTimePickerHookForm = (field) => {

  const {
    label, Controller, dateFormat, control, register, name, defaultValue, mandatory, errors, rules, placeholder, handleChange, selected, onSelect, buttonCross } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ''} ${buttonCross ? 'cross-btn-container' : ''}`
  const isDisabled = field.disabled === true ? true : false
  let containerId = `${name}_container`;
  return (
    <React.Fragment>
      <div className={className} id={containerId}>
        <label>
          {label} {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <div className="p-relative pr-0">
          <Controller
            name={name}
            control={control}
            rules={rules}
            {...register}
            defaultValue={defaultValue}
            render={({ field: { onChange, onBlur, value, name } }) => (

              // return (
              <DatePicker
                {...field}
                id={name}
                name={name}
                value={value}
                dateFormat={"dd/MM/yyyy HH:mm"}
                timeFormat={'HH:mm'}
                placeholderText={placeholder}
                //maxDate={new Date()}
                //minDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                readonly="readonly"
                onBlur={() => null}
                selected={selected}
                className={field.className}
                onChange={(e) => {
                  onChange(e)
                  handleChange(e)
                  onSelect(e)
                }}
                autoComplete={field.autoComplete}
                disabledKeyboardNavigation
                disabled={isDisabled}
              />
              // )
            )}
          />
          {errors && errors?.type === 'required' ? <div className="text-help">This field is required</div>
            : errors && errors?.type !== 'required' ? <div className="text-help">{(errors?.message || errors?.type)}</div> : ''}
        </div>
      </div>
    </React.Fragment>
  )
}

export const AllApprovalField = (props) => {
  const { label, mandatory, className, id, approverList, popupButton } = props
  const InputClassName = `form-control ${className ? className : ""}`;
  let value = approverList.length !== 0 ? `${approverList[0].label} ${approverList.length > 1 ? '...' : ''}` : '-';
  return (
    <>
      <div className={'form-group all-approval'}>

        <label className={label === false ? 'd-none' : ''}>
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <div id={id ? id : ''} className="approval-container">
          <input
            className={InputClassName}
            disabled={true}
            placeholder={'-'}
            value={value}
            autoComplete={'off'}
          />
          {approverList.length > 1 && <Popup trigger={<button id={`popUpTriggerProfit`} className="view-btn" type={'button'}>{popupButton}</button>}
            position="left center">
            <ul className="px-1 view-all-list">
              {approverList && approverList?.map((item, index) => {
                return <li key={item.value}>{index + 1}. {item.label}</li>
              })}
            </ul>

          </Popup>}
        </div>
      </div>
    </>
  )
}

export const AsyncDropdownHookForm = ({
  name,
  label,
  value,
  onChange,
  loadOptions,
  isDisabled = false,
  isRequired = true,
  error,
  showAddButton = false,
  onAddClick,
  placeholder = "Select",
  className = "",
  containerClassName = "col-md-15",
  onBlur = () => {}
}) => {
  const [inputLoader, setInputLoader] = useState(false);
  
  const handleLoadOptions = (inputValue) => {
    setInputLoader(true);
    return Promise.resolve(loadOptions(inputValue))
      .finally(() => {
        setInputLoader(false);
      });
  };
  
  // Check if the value is empty (considering different possible formats)
  const isValueEmpty = () => {
    if (!value) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  };
  
  return (
    <Col className={containerClassName}>
      <label>
        {label}
        {isRequired && <span className="asterisk-required">*</span>}
      </label>
      <div className="d-flex justify-space-between align-items-center p-relative async-select">
        <div className="fullinput-icon p-relative">
          {inputLoader && <LoaderCustom customClass={`input-loader`} />}
          <AsyncSelect
            name={name}
            loadOptions={handleLoadOptions}
            onChange={onChange}
            value={value}
            noOptionsMessage={({ inputValue }) => 
              inputValue?.length < 3 
                ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN 
                : "No results found"
            }
            isDisabled={isDisabled}
            onKeyDown={(onKeyDown) => {
              if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) 
                onKeyDown.preventDefault();
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            className={className}
          />
        </div>
        {showAddButton && !isDisabled && (
          <Button
            id={`${name}_toggle`}
            onClick={onAddClick}
            className={"right mt-0"}
            variant="plus-icon-square"
          />
        )}
      </div>
      {error && isValueEmpty() && <div className="text-help">{error.message || "This field is required."}</div>}
    </Col>
  );
};