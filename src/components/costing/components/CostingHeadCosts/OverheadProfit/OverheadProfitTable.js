import React from 'react';
import { Col, Row, Table } from 'reactstrap';
import { checkForDecimalAndNull, number, checkWhiteSpaces, positiveAndDecimalNumber, maxLength10, decimalLengthsix } from '../../../../../helper';
import { TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import Popup from 'reactjs-popup';
import { REMARKMAXLENGTH } from '../../../../../config/masterData';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import TooltipCustom from '../../../../common/Tooltip';

const OverheadProfitTable = ({
  data,
  type,
  Controller,
  control,
  register,
  setValue,
  getValues,
  errors,
  CostingViewMode,
  initialConfiguration,
  onCostChange,
  onRemarkPopUpClick,
  onRemarkPopUpClose
}) => {

  return (
    <Col md="12">
      <Table className="table mb-0 forging-cal-table mt-2" size="sm">
        <thead>
          <tr>
            <th>{type} On</th>
            <th>Percentage (%)</th>
            <th>Cost (Applicability)</th>
            <th>{type}</th>
            <th className='text-center'>Remark</th>
          </tr>
        </thead>
        <tbody>
          {(data?.CostingApplicabilityDetails?.length === 0 || data?.CostingApplicabilityDetails === null || data?.CostingApplicabilityDetails === undefined) && (
            <tr>
              <td colSpan={4} className="text-center">
                <NoContentFound title={EMPTY_DATA} />
              </td>
            </tr>
          )}
          {data?.CostingApplicabilityDetails?.map((item, index) => {
            const fieldPrefix = type === 'Overhead' ? 'Overhead' : 'Profit';
            const fieldSuffix = item.Applicability;
            const isFixedRecord = item.Applicability === 'Fixed';

            return (
              <tr key={item.ApplicabilityDetailsId}>
                <td>{item.Applicability}</td>
                <td>
                  <TextFieldHookForm
                    label=''
                    name={`${fieldPrefix}${fieldSuffix}Percentage`}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={item.Percentage !== null ? checkForDecimalAndNull(item.Percentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors[`${fieldPrefix}${fieldSuffix}Percentage`]}
                    disabled={true}
                  />
                </td>
                <td>
                  <div className={`${item?.Applicability === 'CC' ? 'd-flex align-items-start justify-content-end flex-row-reverse gap-2' : ''}`}>
                    {item?.Applicability === 'CC' &&
                      <TooltipCustom
                        disabledIcon={false}
                        id={`${fieldPrefix}${fieldSuffix}Cost`}
                        tooltipText={`If the selected applicability includes 'Excluding Int. + Dep.', only costs excluding Interest and Depreciation will be added.`}
                      />}
                    <TextFieldHookForm
                      label=""
                      name={`${fieldPrefix}${fieldSuffix}Cost`}
                      id={`${fieldPrefix}${fieldSuffix}Cost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      rules={{
                        required: false,
                        validate: {
                          number,
                          checkWhiteSpaces,
                          positiveAndDecimalNumber,
                          maxLength10,
                          decimalLengthsix
                        },
                      }}
                      mandatory={false}
                      handleChange={(e) => onCostChange(e, item)}
                      defaultValue={item.Cost !== null ? checkForDecimalAndNull(item.Cost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors[`${fieldPrefix}${fieldSuffix}Cost`]}
                      disabled={!isFixedRecord || CostingViewMode}
                    />
                  </div>
                </td>
                <td>
                  <TextFieldHookForm
                    label=""
                    name={`${fieldPrefix}${fieldSuffix}TotalCost`}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={item.TotalCost !== null ? checkForDecimalAndNull(item.TotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors[`${fieldPrefix}${fieldSuffix}TotalCost`]}
                    disabled={true}
                  />
                </td>
                {index === 0 && (
                  <td className='text-center align-middle border-start' rowSpan={data?.CostingApplicabilityDetails?.length === 0 || data?.CostingApplicabilityDetails === null || data?.CostingApplicabilityDetails === undefined ? 1 : data?.CostingApplicabilityDetails?.length}>
                    <Popup trigger={<button id={`popUpTrigger${type}`} title="Remark" className="Comment-box" type={'button'} />}
                      position="top center">
                      <TextAreaHookForm
                        label="Remark:"
                        name={`${type.toLowerCase()}Remark`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          maxLength: REMARKMAXLENGTH
                        }}
                        handleChange={() => { }}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors[`${type.toLowerCase()}Remark`]}
                        disabled={CostingViewMode}
                        hidden={false}
                      />
                      <Row>
                        <Col md="12" className='remark-btn-container'>
                          <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={onRemarkPopUpClick} > <div className='save-icon'></div> </button>
                          <button className='reset' onClick={onRemarkPopUpClose} > <div className='cancel-icon'></div></button>
                        </Col>
                      </Row>
                    </Popup>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Col>
  );
};

export default OverheadProfitTable;