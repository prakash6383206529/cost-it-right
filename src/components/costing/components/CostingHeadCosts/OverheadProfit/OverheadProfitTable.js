import React from 'react';
import { Col, Row } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../../helper';
import { TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import Popup from 'reactjs-popup';
import { REMARKMAXLENGTH } from '../../../../../config/masterData';

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
      <Col md="2">
        <span className="head-text">
          {type}
        </span>
      </Col>
      <Col md="1" className="text-center">
        <span className="head-text">
          {'Remark'}
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
        <Col md="2">
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
        {data?.CostingApplicabilityDetails?.length > 0 && data?.CostingApplicabilityDetails?.findIndex(detail => detail === item) === Math.floor(data?.CostingApplicabilityDetails?.length / 2) - 1 && (
          <Col md="1" className='second-section'>
            <div className='costing-border-inner-section'>
              <Col md="12" className='text-center'>Remark</Col>
              <Col md="12"> <Popup trigger={<button id={`popUpTrigger${type}`} title="Remark" className="Comment-box" type={'button'} />}
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
              </Popup></Col>
            </div>
          </Col>
        )}
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