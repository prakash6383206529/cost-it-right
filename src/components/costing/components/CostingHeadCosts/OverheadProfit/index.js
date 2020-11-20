import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { fetchModelTypeAPI, fetchCostingHeadsAPI, } from '../../../../../actions/Common';
import Switch from "react-switch";

function OverheadProfit(props) {

  const defaultValues = {

  }

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const dispatch = useDispatch()

  const [dataObj, setDataObj] = useState({})

  const [modelType, setModelType] = useState([])
  const [applicability, setApplicability] = useState([])
  const [netOverheadAndProfit, setNetOverheadAndProfit] = useState(0)

  const [isInventoryApplicable, setIsInventoryApplicable] = useState(false)
  const [ICCapplicability, setICCapplicability] = useState([])

  const [isPaymentTermsApplicable, setIsPaymentTermsApplicable] = useState(false)
  const [paymentTermsApplicability, setPaymentTermsApplicability] = useState([])

  useEffect(() => {
    //props.setSurfaceCost(gridData, props.index)
  }, []);

  useEffect(() => {
    dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
    dispatch(fetchCostingHeadsAPI('--Costing Heads--', (res) => { }))
  }, []);

  const modelTypes = useSelector(state => state.comman.modelTypes)
  const costingHead = useSelector(state => state.comman.costingHead)

  /**
  * @method renderListing
  * @description RENDER LISTING
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'ModelType') {
      modelTypes && modelTypes.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'Applicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
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
    * @method handleApplicabilityChange
    * @description  USED TO HANDLE APPLICABILITY CHANGE
    */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setApplicability(newValue)
    } else {
      setApplicability([])
    }
  }

  /**
   * @method onPressInventory
   * @description  USED TO HANDLE INVENTORY CHANGE
   */
  const onPressInventory = () => {
    setIsInventoryApplicable(!isInventoryApplicable)
  }

  /**
   * @method handleICCApplicabilityChange
   * @description  USED TO HANDLE ICC APPLICABILITY CHANGE
   */
  const handleICCApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setICCapplicability(newValue)
    } else {
      setICCapplicability([])
    }
  }

  /**
   * @method onPressPaymentTerms
   * @description  USED TO HANDLE INVENTORY CHANGE
   */
  const onPressPaymentTerms = () => {
    setIsPaymentTermsApplicable(!isPaymentTermsApplicable)
  }

  /**
   * @method handlePaymentTermsApplicabilityChange
   * @description  USED TO HANDLE PAYMENT TERM APPLICABILITY CHANGE
   */
  const handlePaymentTermsApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setPaymentTermsApplicability(newValue)
    } else {
      setPaymentTermsApplicability([])
    }
  }


  /**
    * @method onSubmit
    * @description Used to Submit the form
    */
  const onSubmit = (values) => {
    console.log('values >>>', values);
    let data = {

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
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
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
                  {'Overheads (RM+CC+BOP)'}
                </div>
              </Col>

              <Col md="3">
                <label>
                  {'Overhead On'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Percentage (%)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Cost(Applicability)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Overhead'}
                </label>
              </Col>

              {
                dataObj && dataObj.IsOverheadFixed &&
                <>
                  <Col md="3">
                    <label>
                      {'Fixed'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadFixedPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadFixedPercentage}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadFixedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadFixedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadFixedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadFixedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                dataObj && dataObj.IsOverheadCombined &&
                <>
                  <Col md="3">
                    <label>
                      {'COMBINED TEXT GOES HERE'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCombinedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCombinedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCombinedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCombinedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                dataObj && dataObj.IsOverheadRMApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'RM'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadRMPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadRMPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadRMCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadRMCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadRMTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadRMTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                dataObj && dataObj.IsOverheadBOPApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'BOP'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadBOPPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadBOPPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadBOPCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadBOPCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadBOPTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadBOPTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

              {
                dataObj && dataObj.IsOverheadCCApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'CC'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCCPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCCPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCCCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCCCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCCTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCCTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }










              <Col md="12">
                <div className="left-border">
                  {'Profits (RM+CC+BOP)'}
                </div>
              </Col>

              <Col md="3">
                <label>
                  {'Profit On'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Percentage (%)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Cost(Applicability)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Profit'}
                </label>
              </Col>


              {
                dataObj && dataObj.IsOverheadFixed &&
                <>
                  <Col md="3">
                    <label>
                      {'Fixed'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitFixedPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitFixedPercentage}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitFixedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitFixedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitFixedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitFixedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                dataObj && dataObj.IsProfitCombined &&
                <>
                  <Col md="3">
                    <label>
                      {'COMBINED TEXT GOES HERE'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCombinedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCombinedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCombinedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCombinedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                dataObj && dataObj.IsProfitRMApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'RM'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitRMPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitRMPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitRMCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitRMCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitRMTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitRMTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

              {
                dataObj && dataObj.IsProfitBOPApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'BOP'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitBOPPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitBOPPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitBOPCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitBOPCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitBOPTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitBOPTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

              {
                dataObj && dataObj.IsProfitCCApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'CC'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCCPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCCPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCCCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCCCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCCTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCCTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

            </Row>









            <Row>
              <Col md="12">
                <div className="left-border">
                  {'Rejection:'}
                </div>
              </Col>

              <Col md="3">
                <SearchableSelectHookForm
                  label={'Applicability'}
                  name={'Applicability'}
                  placeholder={'-Select-'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: true }}
                  register={register}
                  defaultValue={applicability.length !== 0 ? applicability : ''}
                  options={renderListing('Applicability')}
                  mandatory={true}
                  handleChange={handleApplicabilityChange}
                  errors={errors.Applicability}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Rejection (%)"
                  name={'RejectionPercentage'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.'
                    },
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionPercentage}
                  disabled={false}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Cost(Applicability)"
                  name={'RejectionCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionCost}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Net Rejection"
                  name={'RejectionTotalCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionTotalCost}
                  disabled={true}
                />
              </Col>
            </Row>




            <Row>
              <Col md="2" className="switch mb15">
                <label className="switch-level">
                  <div className={'left-title'}>{''}</div>
                  <Switch
                    onChange={onPressInventory}
                    checked={isInventoryApplicable}
                    id="normal-switch"
                    disabled={false}
                    background="#4DC771"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#CCC"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={46}
                  />
                  <div className={'right-title'}>Inventory Carrying Cost</div>
                </label>
              </Col>
              <Col md="8">
                {''}
              </Col>

              {isInventoryApplicable &&
                <>
                  <Col md="3">
                    <SearchableSelectHookForm
                      label={'ICC Applicability'}
                      name={'ICCApplicability'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={ICCapplicability.length !== 0 ? ICCapplicability : ''}
                      options={renderListing('ICCApplicability')}
                      mandatory={true}
                      handleChange={handleICCApplicabilityChange}
                      errors={errors.ICCApplicability}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Interest Rate(%)"
                      name={'InterestRatePercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InterestRatePercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Cost(Applicability)"
                      name={'InterestRateCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InterestRateCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Net ICC"
                      name={'NetICCTotal'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.NetICCTotal}
                      disabled={true}
                    />
                  </Col>
                </>}
            </Row>




            <Row>
              <Col md="2" className="switch mb15">
                <label className="switch-level">
                  <div className={'left-title'}>{''}</div>
                  <Switch
                    onChange={onPressPaymentTerms}
                    checked={isPaymentTermsApplicable}
                    id="normal-switch"
                    disabled={false}
                    background="#4DC771"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#CCC"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={46}
                  />
                  <div className={'right-title'}>Payment Terms</div>
                </label>
              </Col>
              <Col md="8">
                {''}
              </Col>

              {isPaymentTermsApplicable &&
                <>
                  <Col md="3">
                    <SearchableSelectHookForm
                      label={'Payment Terms Applicability'}
                      name={'PaymentTermsApplicability'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={paymentTermsApplicability.length !== 0 ? paymentTermsApplicability : ''}
                      options={renderListing('PaymentTermsApplicability')}
                      mandatory={true}
                      handleChange={handlePaymentTermsApplicabilityChange}
                      errors={errors.PaymentTermsApplicability}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Repayment Period(No. of Days)"
                      name={'RepaymentPeriodDays'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RepaymentPeriodDays}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Interest Rate(%)"
                      name={'RepaymentPeriodPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RepaymentPeriodPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Cost"
                      name={'RepaymentPeriodCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RepaymentPeriodCost}
                      disabled={true}
                    />
                  </Col>
                </>}
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between mt25">
              <div className="col-sm-12 text-right bluefooter-butn">
                <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'Save'}
                </button>
              </div>
            </Row>
          </form>
        </div>
      </div>

    </ >
  );
}

export default OverheadProfit;