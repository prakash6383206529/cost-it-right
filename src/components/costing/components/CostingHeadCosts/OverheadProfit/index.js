import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddSurfaceTreatment from '../../Drawers/AddSurfaceTreatment';

function OverheadProfit(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState([])
  const [modelType, setModelType] = useState([])
  const [netOverheadAndProfit, setNetOverheadAndProfit] = useState(0)
  const [overheadON, setOverheadON] = useState(0)
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    //props.setSurfaceCost(gridData, props.index)
  }, []);


  /**
  * @method renderListing
  * @description RENDER LISTING
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'ModelType') {
      // UOMSelectList && UOMSelectList.map(item => {
      //   if (item.Value === '0') return false;
      //   temp.push({ label: item.Text, value: item.Value })
      //   return null;
      // });
      return temp;
    }

  }

  /**
    * @method handleModelTypeChange
    * @description  USED TO HANDLE MODEL TYPE CHANGE
    */
  const handleModelTypeChange = (newValue) => {
    if (newValue && newValue !== '') {
      setModelType(newValue)
    } else {
      setModelType([])
    }
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row>
            <Col md="12">
              <div className="left-border">
                {'Overhead & Profit:'}
              </div>
            </Col>


            <Col md="3">
              <SearchableSelectHookForm
                label={'Model Type for Overhead/Profit'}
                name={'ModelType'}
                placeholder={'-Select-'}
                Controller={Controller}
                control={control}
                rules={{ required: true }}
                register={register}
                defaultValue={modelType.length !== 0 ? modelType : ''}
                options={renderListing('ModelType')}
                mandatory={true}
                handleChange={handleModelTypeChange}
                errors={errors.ModelType}
              />
            </Col>

            <Col md="7">
              {''}
            </Col>

            <Col md="2">
              <label>
                {'Net Overhead & Profit'}
              </label>
              {netOverheadAndProfit}
            </Col>

            <Col md="12">
              <div className="left-border">
                {'Overheads:'}
              </div>
            </Col>

            <Col md="3">
              <label>
                {'Overhead On'}
              </label>
              {overheadON}
            </Col>
            <Col md="3">
              <label>
                {'Percentage (%)'}
              </label>
              {percentage}
            </Col>
            <Col md="3">
              <label>
                {'Cost(Applicability)'}
              </label>
              {percentage}
            </Col>
            <Col md="3">
              <label>
                {'Overhead'}
              </label>
              {percentage}
            </Col>


            <Col md="12">
              <div className="left-border">
                {'Profit:'}
              </div>
            </Col>

            <Col md="3">
              <label>
                {'Overhead On'}
              </label>
              {overheadON}
            </Col>
            <Col md="3">
              <label>
                {'Percentage (%)'}
              </label>
              {percentage}
            </Col>
            <Col md="3">
              <label>
                {'Cost(Applicability)'}
              </label>
              {percentage}
            </Col>
            <Col md="3">
              <label>
                {'Overhead'}
              </label>
              {percentage}
            </Col>

          </Row>

          <Row>
            <Col md="12">
              <div className="left-border">
                {'Rejection:'}
              </div>
            </Col>

            <Col md="3">
              <label>
                {'Overhead On'}
              </label>
              {overheadON}
            </Col>
            <Col md="3">
              <label>
                {'Percentage (%)'}
              </label>
              {percentage}
            </Col>
            <Col md="3">
              <label>
                {'Cost(Applicability)'}
              </label>
              {percentage}
            </Col>
            <Col md="3">
              <label>
                {'Overhead'}
              </label>
              {percentage}
            </Col>
          </Row>

        </div>
      </div>

    </ >
  );
}

export default OverheadProfit;