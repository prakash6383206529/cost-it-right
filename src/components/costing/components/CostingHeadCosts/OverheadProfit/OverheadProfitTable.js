import React from 'react';
import { Col, Row } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../../helper';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';

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
}) => {
  const renderTableHeader = () => (
    <Row className="costing-border-inner-section m-0">
      <Col md="3">
        <span className="head-text">
          {`${type} On`}
        </span>
      </Col>
      <Col md="3">
        <span className="head-text">
          {`Percentage (%)`}
        </span>
      </Col>
      <Col md="3">
        <span className="head-text">
          {'Cost (Applicability)'}
        </span>
      </Col>
      <Col md="3">
        <span className="head-text">
          {type}
        </span>
      </Col>
    </Row>
  );

  const renderTableRow = (item) => {
    const fieldPrefix = type === 'Overhead' ? 'Overhead' : 'Profit';
    const fieldSuffix = item.Applicability;
    const isFixedRecord = item.Applicability === 'Fixed';
    
    return (
      <Row key={item.ApplicabilityDetailsId} className="costing-border-inner-section m-0">
        <Col md="3">
          <label className="col-label">
            {item.Applicability}
          </label>
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label=''
            name={`${fieldPrefix}${fieldSuffix}Percentage`}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={() => {}}
            defaultValue={item.Percentage !== null ? checkForDecimalAndNull(item.Percentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
            className=""
            customClassName={'withBorder'}
            errors={errors[`${fieldPrefix}${fieldSuffix}Percentage`]}
            disabled={true}
          />
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label=""
            name={`${fieldPrefix}${fieldSuffix}Cost`}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={(e) => onCostChange(e, item)}
            defaultValue={item.Cost !== null ? checkForDecimalAndNull(item.Cost, initialConfiguration?.NoOfDecimalForPrice) : ''}
            className=""
            customClassName={'withBorder'}
            errors={errors[`${fieldPrefix}${fieldSuffix}Cost`]}
            disabled={!isFixedRecord || CostingViewMode}
          />
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label=""
            name={`${fieldPrefix}${fieldSuffix}TotalCost`}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={() => {}}
            defaultValue={item.TotalCost !== null ? checkForDecimalAndNull(item.TotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
            className=""
            customClassName={'withBorder'}
            errors={errors[`${fieldPrefix}${fieldSuffix}TotalCost`]}
            disabled={true}
          />
        </Col>
      </Row>
    );
  };

  return (
    <>
      {renderTableHeader()}
      {data?.CostingApplicabilityDetails?.map(renderTableRow)}
    </>
  );
};

export default OverheadProfitTable; 