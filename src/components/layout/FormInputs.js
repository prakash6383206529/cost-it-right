import React from "react";
import Select, { createFilter } from "react-select";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import "./formInputs.scss";
import { SPACEBAR } from "../../config/constants";
import { validateSpecialChars } from "../../helper";
import WarningMessage from "../common/WarningMessage";

/*
@method: renderLoginTextInputField
@desc: Render login page input
*/
const handleInputChange = (input, field, e) => {
  const value = e.target.value;
  const validationError = validateSpecialChars(value);

  try {
    if (validationError) {
      input.onChange(value);
      field.meta.error = validationError;
      field.meta.touched = true;
      input.onBlur(); // Force error display

      // Just set the error without throwing SubmissionError
      return false;
    } else {
      input.onChange(e);
      return true;
    }
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};
export const validateForm = values => {
  
  const errors = {};
  Object.keys(values).forEach(fieldName => {
    const convertLowerCase = fieldName ? fieldName.toLowerCase() : '';
    if (!convertLowerCase.includes('date')) {
      const value = values[fieldName];
      const validationError = validateSpecialChars(value);
      if (validationError) {
        errors[fieldName] = validationError;
      }
    }
  });
  return errors;
};

export function renderLoginTextInputField(field) {
  const {
    input,
    meta: { touched, error },
    label,
    ...others
  } = field;
  return (
    <div className="input-form-group email-block">
      <label>{label}</label>
      <div className="inputbox input-group ">
        <input
          maxLength={field.mxlength}
          {...others}
          type="email"
          className={`form-control`}
          {...input}
          onChange={(e) => handleInputChange(input, field, e)}
        />
        <div className="input-group-prepend">
          <span className="input-group-text bg-white">
            <i className="fas fa-envelope mr-1" />
          </span>
        </div>
      </div>
      <div className="text-help mb-2">{touched ? error : ""}</div>
    </div>
  );
}

/*
@method: renderFileInputField
@desc: Render file upload input field
*/
export function renderFileInputField(field) {
  const { input, label, ...others } = field;
  return (
    <div className="input-form-group">
      <label>{label}</label>
      <div className="input-group bdr-btm">
        <input
          maxLength={field.mxlength}
          {...others}
          type="file"
          className={`form-control`}
          {...input}
        />
        <div className="input-group-prepend">
          <span className="input-group-text bg-primary" />
        </div>
      </div>
    </div>
  );
}

/*
@method: renderLoginPasswordInputField
@desc: Render number type input
*/
export function renderLoginPasswordInputField(field) {
  const {
    input,
    meta: { touched, error },
    label,
  } = field;
  const InputClassName = `form-control ${field.className ? field.className : ""
    }`;
  return (
    <div className="input-form-group">
      <label>{label}</label>
      <div className="input-group bdr-btm">
        <input
          maxLength={25}
          type="password"
          className={InputClassName}
          {...input}
        />
        <div className="input-group-prepend">
          <span className="input-group-text bg-primary">
            <i className="fas fa-lock mr-1" />
          </span>
        </div>
      </div>
      <div className="text-help mb-2">{touched ? error : ""}</div>
    </div>
  );
}

/*
@method: renderCheckboxInputField
@desc: Render radio input
*/
export function renderCheckboxInputField(field) {
  const { input, ...others } = field;
  const InputClassName = `d-flex align-items-center ${field.className ? field.className : ""
    }`;
  return (
    <div className={InputClassName}>
      <input
        {...others}
        id={field.input.name}
        className="m-0 align-middle"
        {...input}
        checked={field.checked}
      />
      <label
        htmlFor={field.input.name}
        className="btn btn-link align-middle checkbox-label"
      >
        {field.label}
      </label>
    </div>
  );
}

export function renderCheckboxInputFieldWithValidation(field) {
  const {
    input,
    meta: { touched, error },
    label,
    ...others
  } = field;
  const InputClassName = `${field.className ? field.className : ""}`;
  return (
    <div className="input-form-group">
      <div className={InputClassName}>
        <input
          {...others}
          id={field.input.name}
          className="m-0 align-middle"
          {...input}
        />
        <label
          htmlFor={field.input.name}
          className="btn btn-link align-middle checkbox-label"
        >
          {label}
        </label>
      </div>
      <div className="text-help mb-2 float-left ">{touched ? error : ""}</div>
    </div>
  );
}

/*
@method: renderPasswordInputField
@desc: Render password input
*/
export function renderPasswordInputField(field) {
  const {
    input,
    meta: { touched, error, active },
  } = field;
  const inputbox = `inputbox input-group ${active ? "active" : ""}`;
  const className = `form-group ${field.customClassName ? field.customClassName : ""
    } ${touched && error ? "has-danger" : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""
    }`;
  const placeholder = field.placeholder ? field.placeholder : "";
  const isPwdVisible = field.isShowHide === true ? "text" : "password";
  const eyeIcon = field.isShowHide === true ? "fa-eye" : "fa-eye-slash";
  return (
    <div className={className}>
      <label>
        {field.label}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className={inputbox}>
        <input
          maxLength={field.maxLength}
          type={isPwdVisible}
          className={InputClassName}
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

/*
@method: renderMultiSelectField
@desc: Render multi select input
*/
export function renderMultiSelectField(field) {
  const {
    input, vendorMaster,
    meta: { touched, error, active, form },
  } = field;
  //const inputbox = `inputbox ${active ? "active" : ""}`;
  const inputbox = ` ${active ? "active" : ""}`;
  const className = `form-group ${touched && error ? "has-danger" : ""}`;
  const InputClassName = `basic-multi-select multidropdown-container ${field.className ? field.className : ""
    }`;
  const optionValue = field.optionValue;
  const optionLabel = field.optionLabel;
  const placeholder = field.placeholder ? field.placeholder : "";
  const filterConfig = {
    stringify: option => `${option.label}`,
  };
  const specificIdContainer = `${form}_${input.name}_container`;
  const specificId = `${form}_${input.name}`;
  return (
    <div className={className}>
      <label>
        {field.label}
        {field.mendatory && field.mendatory === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className={inputbox} onClick={field.onTouched} title={field && field?.title ? field.title : field.disabled ? field.selection?.label : ''}>
        <Select
          {...input}
          id={specificIdContainer}
          inputId={specificId}
          className={InputClassName}
          getOptionLabel={optionLabel}
          getOptionValue={optionValue}
          value={field.selection}
          isMulti
          isDisabled={field.disabled}
          instanceId={input.name}
          options={field.options}
          classNamePrefix="select"
          closeMenuOnSelect="false"
          onChange={field.selectionChanged}
          placeholder={placeholder}
          onKeyDown={(onKeyDown) => {
            if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
          }}
          filterOption={createFilter(filterConfig)}
        />
      </div>
      {<div className="text-help mb-2">
        {touched &&
          (field.mendatory && !vendorMaster) &&
          field.selection &&
          field.selection.length === 0
          ? "This field is required."
          : ""}
        {/* <div className="text-help mb-2">{field.isEmpty ? 'This field is required.' : ""}</div> */}
      </div>}
    </div>
  );
}

/*
@method: renderEmailInputField
@desc: Render email input
*/
export function renderEmailInputField(field) {
  const {
    input,
    isDisabled,
    meta: { touched, error, active },
    ...others
  } = field;
  const disabled = isDisabled === true ? true : false;
  const inputbox = `inputbox input-group ${active ? "active" : ""}`;
  const className = `form-group ${field.customClassName ? field.customClassName : ""
    } ${touched && error ? "has-danger" : ""}`;
  const InputClassName = `form-control ${disabled ? "disabled-control " : " "
    } ${field.className ? field.className : ""}`;
  return (
    <div className={className}>
      <label>
        {field.label}
        {field.value}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className={disabled ? `${inputbox} disabledEmail ` : inputbox}>
        <input
          {...others}
          maxLength={field.maxLength}
          disabled={disabled}
          id={field.id}
          placeholder={field.placeholder}
          type="text"
          className={InputClassName}
          {...input}
          autoComplete={'off'}
        />
        <div className="input-group-prepend">
          <span
            className={`input-group-text bg-white ${disabled ? "bg-gray" : ""}`}
          >
            <i className="fa fa-envelope" />
          </span>
        </div>
      </div>
      <div className="text-help mb-2">{touched ? error : ""}</div>
    </div>
  );
}

/*
@method: renderTextInputField
@desc: Render text input
*/
export function renderTextInputField(field) {
  const {
    input,
    meta: { touched, error, active, form },
    children,
    ...others
  } = field;
  const inputbox = `${active ? "active" : ""}`;
  const className = `form-group inputbox  withBorder ${field.customClassName ?? ""}
 ${touched && error ? "has-danger" : ""}`;
  const inputStyle = field.inputStyle ? field.inputStyle : "";
  const inputIconStyle = field.inputIconStyle ? field.inputIconStyle : "";
  const InputClassName = `form-control ${field.className ? field.className : ""}`;
  const specificId = `${form}_${input.name}`;
  return (
    <div className={`${className} ${inputStyle}`}>
      <label>
        {field.label}
        {field.value}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className={inputbox} id={field.id}>
        <input
          title={field.disabled ? field.input?.value : ''}
          id={specificId}
          maxLength={field.maxLength}
          {...others}
          type="text"
          className={`form-control ${InputClassName}`}
          {...input}
          onChange={(e) => handleInputChange(input, field, e)}  // Use custom onChange handler
        />
        {field.iconName && (
          <div className="input-group-prepend">
            <span className={`input-group-text ${inputIconStyle}`}>
              <i className={`fas fa-${field.iconName}`} />
            </span>
          </div>
        )}
      </div>
      {children}
      {(touched || error) && (                 //fixed warning message
        <div className="text-help mb-2">
          {touched ? (validateSpecialChars(input.value) || error) : ""}
        </div>
      )}
      {/* <div className="text-help mb-2">
        {touched ? (validateSpecialChars(input.value) || error) : ""}
      </div> */}
      {field?.warningMessage && (
        <WarningMessage dClass={field?.warningMessageClass} message={field?.warningMessage} />
      )}
    </div>
  );
}

/*
@method: renderSelectField
@desc: Render select input
*/
export function renderSelectField(field) {
  const {
    disabled,
    meta: { touched, error, active },
  } = field;
  const inputbox = ` ${active ? "active" : ""}`;
  const className = `form-group inputbox multidropdown-container ${touched && error ? "has-danger" : ""
    }`;
  const InputClassName = `form-control ${field.className ? field.className : ""
    }`;
  let optionKey = field.optionValue;
  let optionText = field.optionLabel;
  const disabledSelect = disabled ? true : false;
  return (
    <div className={className}>
      <label>
        {field.label}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className={inputbox}>
        <select
          disabled={disabledSelect}
          className={InputClassName}
          {...field.input}
        >
          {field.isSelect === false && <option value="">Select</option>}
          {field.options.map((data) => {
            return (
              <option key={data[optionKey]} value={data[optionKey]}>
                {data[optionText]}
              </option>
            );
          })}
        </select>
      </div>
      <div className="text-help mb-2">{touched ? error : ""}</div>
    </div>
  );
}

/*
@method: renderNumberInputField
@desc: Render number input
*/
export function renderNumberInputField(field) {
  const {
    input,
    disabled,
    meta: { touched, error },
    ...others
  } = field;
  const customClassName = `${field.customClassName ? field.customClassName : ""
    }`;
  const InputClassName = `form-control ${field.customClassName ? field.customClassName : ""
    } ${field.className ? field.className : ""}`;
  const disabledLabel = disabled ? true : false;
  return (
    <div className={`form-group inputbox ${customClassName}`}>
      <label>
        {field.label}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className="input-group">
        <input
          {...others}
          type={'number'}
          className={InputClassName}
          maxLength={field.maxLength}
          value={field.Value}
          disabled={disabledLabel}
          autoComplete={'off'}
          {...input}
        />
        {/* <div className="input-group-prepend">
          <span className="input-group-text bg-white">
            <i className="fas fa-phone fa-rotate-90" />
          </span>
        </div> */}
      </div>
      <div className="text-help mb-2">{touched ? error : ""}</div>
    </div>
  );
}

/*
@method: renderTextAreaField
@desc: Render textarea input
*/
export function renderTextAreaField(field) {

  const {
    input,
    disabled,
    meta: { touched, error, form },
  } = field;
  const customClass = `${field.customClassName ? field.customClassName : ""}`;
  const disabledLabel = disabled ? true : false;
  const placeholder = field.placeholder ? field.placeholder : "";
  const specificId = `${form}_${input.name}`;
  return (
    <div className={`form-group ${customClass}`}>
      <label>
        {field.label}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}
      </label>
      <div className="inputbox ">
        <textarea
          title={field.disabled ? field.input?.value : ''}
          maxLength={field.maxLength}
          value={field.value}
          className="form-control withoutBorder"
          {...input}
          id={specificId}
          onChange={(e) => handleInputChange(input, field, e)}
          placeholder={placeholder}
          disabled={disabledLabel}
          autoComplete={'off'}
        />
      </div>
      {/* <div className="text-help mb-2">{touched && field.input.value === '' ? 'This field is required' : ""}</div> */}
      <div className="text-help mb-2">{touched ? (validateSpecialChars(input.value) || error) : ""}</div>
    </div>
  );
}

/*
@method: focusOnError
@desc: focus on the error input
*/
export const focusOnError = (errors) => {
  if (typeof errors !== "undefined" && errors !== null) {
    const errorEl = document.querySelector(
      Object.keys(errors)
        .map((fieldName) => {
          return `[name="${fieldName}"]`;
        })
        .join(",")
    );

    if (errorEl && errorEl.focus) {
      errorEl.focus();
    }
  }
};

/********************************
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 Updated components
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************* 
 ********************************/

export function renderText(field) {
  const {
    input,

    meta: { touched, error, form },
    children,
    ...others
  } = field;

  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""
    } ${touched && error ? "has-danger" : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""
    }`;
  const specificId = `${form}_${input.name}`;
  return (
    <div className={className}>
      <label>
        {field.label}
        {field.value}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}{" "}
      </label>
      <div id={field.id ? field.id : ''}>
        <input
          title={field.disabled ? field.input?.value : ''}
          id={field.id ? field.id : specificId}
          maxLength={field.maxLength}
          {...input}
          {...others}
          className={InputClassName}
          onChange={(e) => handleInputChange(input, field, e)}
          autoComplete={'off'}
        />
      </div>
      {children}
      {(touched || error) && (                                                                               // Fixed required warning message issue
        <div className="text-help mb-2">
          {touched ? (validateSpecialChars(input.value) || error) : ""}
        </div>
      )}
      {/* <div className="text-help mb-2">{touched ? (validateSpecialChars(input.value) || error) : ""}</div> */}
      {field?.warningMessage && (
        <WarningMessage dClass={field?.warningMessageClass} message={field?.warningMessage} />
      )}
    </div>
  );
}

export function InputHiddenField(field) {
  const { input, ...others } = field;
  return (
    <div>
      <input {...input} {...others} />
    </div>
  );
}

export function renderDatePicker(field) {
  const { input, placeholder, disabled, meta: { touched, error, form }, minDate, maxDate } = field;
  const specificId = `${form}_${input.name}`;
  return (
    <div className={"react-picker-box"}>
      <label>{field.label}{field.required && field.required === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}      </label>
      <DatePicker
        id={specificId}
        {...input}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        maxDate={maxDate ? maxDate : null}
        minDate={minDate ? new Date(minDate) : null}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        readonly="readonly"
        onBlur={field.selected ? () => null : input.onBlur}
        selected={input.value ? new Date(input.value) : null}
        className={field.className}
        onSelect={field.changeHandler ? (date) => field.changeHandler(date) : null}
        autoComplete={field.autoComplete}
        disabledKeyboardNavigation
        onChangeRaw={(e) => e.preventDefault()}
        disabled={disabled}
      />
      {(touched) ? <div className="text-help mb-2 mb-2">{error}</div> : ""}
    </div>
  );
}

export function renderDatePickerOneDayAgo(field) {
  const {
    input,
    placeholder,
    meta: { touched, error },
  } = field;
  const d = new Date();
  return (
    <div>
      <label>
        {field.label}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}{" "}
      </label>
      <DatePicker
        {...input}
        dateFormat="MM/dd/yyyy"
        placeholderText={placeholder}
        //maxDate={new Date()}
        minDate={d.setDate(d.getDate() + 1)}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        readonly="readonly"
        onBlur={() => null}
        selected={input.value ? new Date(input.value) : null}
        className={field.className}
      />
      <div className="text-help mb-2 mb-2">{touched ? error : ""}</div>
    </div>
  );
}

export const searchableSelect = ({
  input,
  label,
  required,
  disabled,
  handleChangeDescription,
  valueDescription,
  options,
  placeholder,
  menuPlacement,
  isClearable,
  meta: { touched, error, dirty, visited, form },
  multi,
  className,
  children,
}) => {
  let isDisable = disabled && disabled === true ? true : false;
  const filterConfig = {
    stringify: option => `${option.label}`,
  };
  const specificIdContainer = `${form}_${input.name}_container`;
  const specificId = `${form}_${input.name}`;
  return (
    <div className="w-100 form-group-searchable-select">
      {label && (
        <label>
          {label}
          {required === true ? (
            <span className="asterisk-required">*</span>
          ) : (
            ""
          )}
        </label>
      )}
      <div title={isDisable ? valueDescription?.label : ''}
      >
        <Select
          {...input}
          id={specificIdContainer}
          inputId={specificId}
          isClearable={isClearable ? true : false}
          options={options}
          instanceId={input.name}
          onChange={handleChangeDescription}
          value={valueDescription}
          isDisabled={isDisable}
          placeholder={placeholder}
          menuPlacement={menuPlacement}
          className={"searchable multidropdown-container"}
          onKeyDown={(onKeyDown) => {
            if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
          }}
          filterOption={createFilter(filterConfig)}
        />
      </div>
      {children}
      <div className="text-help mb-2 mb-2">{touched && error ? error : ""}</div>
    </div>
  );
};

export const RFReactSelect = ({
  input,
  labelKey,
  label,
  mendatory,
  disabled,
  isLoading,
  valueKey,
  options,
  onChangeHsn,
  onMaterialChange,
  rowIndex,
  selType,
  meta: { touched, error },
  multi,
  className,
  onKeyDown
}) => {
  const { name, value, required, onBlur, onChange, onFocus } = input;
  const transformedValue = transformValue(value, options, multi, valueKey);
  let isDisable = disabled && disabled === true ? true : false;
  let loader = isLoading && isLoading === true ? true : false;
  return (
    <div>
      {label && (
        <label>
          {label}
          {mendatory && <span className="asterisk-required">*</span>}
        </label>
      )}
      <Select
        placeholder={"Select"}
        valueKey={valueKey}
        labelKey={labelKey}
        name={name}
        required={required}
        value={transformedValue}
        disabled={isDisable}
        matchProp={"any"}
        multi={multi}
        isLoading={loader}
        options={options}
        onChange={
          multi
            ? multiChangeHandler(onChange, valueKey)
            : singleChangeHandler(
              onChange,
              onChangeHsn,
              onMaterialChange,
              rowIndex,
              valueKey,
              selType
            )
        }
        onBlur={() => onBlur(value)}
        onFocus={onFocus}
        className={className}
        onKeyDown={(onKeyDown) => {
          if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
        }}
      />
      {touched && error}
    </div>
  );
};

RFReactSelect.defaultProps = {
  multi: false,
  className: "",
};

RFReactSelect.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    //value: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
  }).isRequired,
  options: PropTypes.array.isRequired,
  multi: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * onChange from Redux Form Field has to be called explicity.
 */
function singleChangeHandler(
  func,
  getHsnDetail,
  onMaterialChange,
  rowIndex,
  key,
  type
) {
  return function handleSingleChange(value) {
    func(value ? value[key] : "");

    if (onMaterialChange !== undefined) {
      setTimeout(function () {
        onMaterialChange(value ? value : "", rowIndex);
      }, 1000);
    }

    if (getHsnDetail !== undefined) {
      if (type !== undefined) {
        setTimeout(function () {
          getHsnDetail(value ? value[key] : "", rowIndex, type);
        }, 1000);
      } else {
        getHsnDetail(value ? value[key] : "");
      }
    }
  };
}

/**
 * onBlur from Redux Form Field has to be called explicity.
 */
function multiChangeHandler(func, key) {
  return function handleMultiHandler(values) {
    func(values.map((value) => value[key]));
  };
}

function transformValue(value, options, multi, key) {
  if (multi && typeof value === "string") return [];

  const filteredOptions = options.filter((option) => {
    return multi ? value.indexOf(option[key]) !== -1 : option[key] === value;
  });

  return multi ? filteredOptions : filteredOptions[0];
}

/**
 * @method renderYearPicker
 * @description Render year picker calander
*/

export function renderYearPicker(field) {
  const {
    input,
    placeholder,
    meta: { touched, error },
  } = field;
  return (
    <div className={"react-picker-box"}>
      <label>
        {field.label}
        {field.required && field.required === true ? (
          <span className="asterisk-required">*</span>
        ) : (
          ""
        )}{" "}
      </label>
      <DatePicker
        {...input}
        dateFormat="yyyy"
        placeholderText={placeholder}
        //maxDate={new Date()}
        //minDate={new Date()}
        showMonthDropdown
        showYearDropdown
        showYearPicker
        dropdownMode="select"
        readonly="readonly"
        onBlur={() => null}
        selected={input.value ? new Date(input.value) : null}
        className={field.className}
        onSelect={
          field.changeHandler ? (date) => field.changeHandler(date) : null
        }
        autoComplete={field.autoComplete}
        disabledKeyboardNavigation
        onChangeRaw={(e) => e.preventDefault()}
      />
      {touched ? <div className="text-help mb-2 mb-2">{error}</div> : ""}
    </div>
  );
}