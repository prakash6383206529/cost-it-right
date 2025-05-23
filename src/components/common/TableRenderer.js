import React from "react";
import { Row, Col, Label, Table, FormGroup, Input } from 'reactstrap';
import NoContentFound from "./NoContentFound";
import { nonZero, number, maxLength7, checkWhiteSpaces, checkForDecimalAndNull } from "../../helper/validation";
import { TextFieldHookForm } from "../layout/HookFormInputs";
import { getConfigurationKey } from "../../helper";

const TableRenderer =  ({
  data = [],
  columns = [],
  register,
  Controller,
  control,
  errors = {},
  isViewMode = false,
  handleDelete = () => {},
  state = {},
  setValue
}) => {
  const renderTextField = ({
    item,
    fieldKey,
    placeholder,
    handleChangeFn,
    valueKey,
    index,
    col,
  }) => {
    const fieldName = `${fieldKey}_${index}`;

    const defaultHandleChange = (e) => {
    };

    const onChangeHandler = (e) => {
        if (handleChangeFn) {
            handleChangeFn(e, item, index, col);
        } else {
            defaultHandleChange(e);
        }
    };

    setValue(fieldName, item?.[valueKey])

    // Check if disabled is a function and evaluate it
    const isDisabled = typeof col?.disabled === 'function' 
        ? col.disabled(item)
        : col?.disabled;

    return (
      <TextFieldHookForm
        label={false}
        name={fieldName}
        Controller={Controller}
        control={control}
        register={register}
        type="text"
        placeholder={isViewMode ? "-" : placeholder}
        rules={{
          validate: {number, checkWhiteSpaces, maxLength7, ...col?.validate}
        }}
        value={item?.[valueKey]}
        defaultValue={item?.[valueKey]}
        handleChange={onChangeHandler}
        customClassName={"withBorder mb-0 min-h-auto"}
        className="w-auto min-h-auto"
        disabled={isViewMode || isDisabled}
        errors={errors[fieldName]}
      />
    );
  };

  return (
    <table className="table border" size="sm">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx}>{col?.columnHead}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              {columns.map((col, colIdx) => {
                if (col.type === "textField") {
                  return (
                    <td key={colIdx}>
                      {renderTextField({
                        item,
                        fieldKey: col?.fieldKey,
                        placeholder: "Enter",
                        handleChangeFn: col?.handleChangeFn,
                        valueKey: col?.valueKey,
                        index: index,
                        col: col,
                      })}
                    </td>
                  );
                } else if (col.key === "action") {
                  return (
                    <td key={colIdx}>
                      <button
                        className="Delete"
                        title="Delete"
                        type="button"
                        disabled={isViewMode || item?.IsAssociated}
                        onClick={() => handleDelete(item)}
                      />
                    </td>
                  );
                } else {
                  console.log(col,'col');
                  
                  return <td key={colIdx}>{col?.identifier === "inputOutput" ? checkForDecimalAndNull(item?.[col.key],getConfigurationKey()?.NoOfDecimalForInputOutput) :col?.identifier === "cost" ? checkForDecimalAndNull(item?.[col.key],getConfigurationKey()?.NoOfDecimalForPrice) : item?.[col.key]}</td>;
                }
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns?.length}>
              <div className="text-center">No data found.</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
export default TableRenderer;
