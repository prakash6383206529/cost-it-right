import React, { useEffect, useState } from "react";
import { Row, Col, Label, Table, FormGroup, Input } from 'reactstrap';
import NoContentFound from "./NoContentFound";
import { nonZero, number, maxLength7, checkWhiteSpaces, checkForDecimalAndNull } from "../../helper/validation";
import { TextFieldHookForm } from "../layout/HookFormInputs";
import { getConfigurationKey } from "../../helper";
import { EMPTY_DATA } from "../../config/constants";
import TooltipCustom from "./Tooltip";

const TableRenderer = ({
  data = [],
  columns = [],
  register,
  Controller,
  control,
  errors = {},
  isViewMode = false,
  handleDelete = () => { },
  state = {},
  setValue,
  isWipInventory = false,
  isInventory = false,
  totalIccPayable = 0,
  totalIccReceivable = 0,
  includeOverHeadProfitIcc = false,
  isCreditBased = false,
  includeChildPartCost = null 
}) => {

  const filteredData = data?.filter(item => {
    const applicability = item?.Applicability;
  
    // Hide Overhead and Profit if includeOverHeadProfitIcc is false
    if (!includeOverHeadProfitIcc && (applicability === "Overhead" || applicability === "Profit")) {
      return false;
    }
  
    // If includeChildPartCost is true, hide Part Cost
    if (includeChildPartCost && applicability === "Part Cost") {
      return false;
    }
  
    // If includeChildPartCost is false, hide RM
    if (!includeChildPartCost && applicability === "RM") {
      return false;
    }
  
    return true;
  });
  

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
    setValue(fieldName, col?.identifier === "cost" ? checkForDecimalAndNull(item?.[valueKey], getConfigurationKey()?.NoOfDecimalForPrice) : item?.[valueKey])

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
          validate: { number, checkWhiteSpaces, maxLength7, ...col?.validate }
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
        {filteredData?.length > 0 ? (
          filteredData.map((item, index) => (
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
                  const randomId = `inventory-net-cost-${Math?.floor(1000000000 + Math?.random() * 9000000000)}`;
                  // Ensure we're rendering a string value
                  const cellValue = col?.identifier === "inputOutput"
                    ? checkForDecimalAndNull(item?.[col.key], getConfigurationKey()?.NoOfDecimalForInputOutput)
                    : col?.identifier === "cost"
                      ? checkForDecimalAndNull(item?.[col.key], getConfigurationKey()?.NoOfDecimalForPrice)
                      : item?.[col.key]??'-';
                      return  <td key={colIdx}>
                  <div className="w-fit d-flex">
                    <div id={randomId}>
                      {cellValue}
                     {(col?.columnHead === 'Net Cost'||col?.columnHead === 'Interest Cost Per Unit') && isCreditBased &&  <TooltipCustom
                        disabledIcon={true}
                        tooltipClass="net-rm-cost"
                        id={randomId}
                        tooltipText={col?.columnHead === 'Interest Cost Per Unit' ?
                          'Interest Cost Per Unit = (Applicability Cost * Interest Days * Interest on Receivables (%)/ Annual ICC) / 365 * 100':
                          item?.InventoryType === "Receivables" ?
                          'Net Cost = (Applicability Cost * Markup Factor * No of Days * Interest on Receivables (%)/ Annual ICC) /365 * 100'
                          :
                          'Net Cost = (Applicability Cost * No of Days * Interest on Receivables (%)/ Annual ICC) /365 * 100'
                        }
                      />}
                    </div>
                  </div>
                </td>
                }
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns?.length}>
              <NoContentFound title={EMPTY_DATA} />
            </td>
          </tr>
        )}
        {(isWipInventory||isInventory) && <tr className='table-footer'>
          <td colSpan={columns.length - 1} className="text-right font-weight-600 fw-bold">{`${isInventory ? 'ICC Payable to Supplier:' : 'ICC Receivable from Supplier:'}`}</td>
          <td colSpan={1}><div className='d-flex justify-content-between'>{checkForDecimalAndNull(isInventory ? totalIccPayable : totalIccReceivable, getConfigurationKey()?.NoOfDecimalForPrice)}</div></td>
        </tr>}
      </tbody>
    </table>
  );
};
export default TableRenderer;
