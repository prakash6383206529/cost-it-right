import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { TextFieldHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getCostingTechnologySelectList, getAllPartSelectList, getPartInfo, checkPartWithTechnology, } from '../actions/Costing';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ErrorMessage } from '@hookform/error-message';


function CostingDetails() {

  const { register, handleSubmit, watch, control, setValue, reset, errors } = useForm();

  const [isEditFlag, setIsEditFlag] = useState(false);
  const [technology, setTechnology] = useState([]);
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
  const [part, setPart] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [IsOpenVendorSOBDetails, setIsOpenVendorSOBDetails] = useState(false);

  const dispatch = useDispatch()
  const technologySelectList = useSelector(state => state.costing.technologySelectList)
  const partSelectList = useSelector(state => state.costing.partSelectList)
  const partInfo = useSelector(state => state.costing.partInfo)

  if (partInfo !== undefined) {
    setValue('PartName', partInfo.PartName)
    setValue("Description", partInfo.Description)
    setValue("ECNNumber", partInfo.ECNNumber)
    setValue("DrawingNumber", partInfo.DrawingNumber)
    setValue("RevisionNumber", partInfo.RevisionNumber)

  }

  useEffect(() => {
    dispatch(getCostingTechnologySelectList(() => { }))

    dispatch(getAllPartSelectList(() => { }))
  }, []);

  /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'Technology') {
      technologySelectList && technologySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'PartList') {
      partSelectList && partSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  /**
  * @method handleTechnologyChange
  * @description  USED TO HANDLE TECHNOLOGY CHANGE
  */
  const handleTechnologyChange = (newValue) => {
    //console.log('newValue: ', newValue);
    if (newValue && newValue !== '') {
      setTechnology(newValue)
      setIsTechnologySelected(true)
    } else {
      setTechnology([])
      setIsTechnologySelected(false)
    }
  }

  /**
  * @method handlePartChange
  * @description  USED TO HANDLE PART CHANGE
  */
  const handlePartChange = (newValue) => {
    if (newValue && newValue !== '') {

      //console.log('technology: ', technology);
      if (IsTechnologySelected) {
        const data = { TechnologyId: technology.value, PartId: newValue.value }
        dispatch(checkPartWithTechnology(data, () => {
          setPart(newValue)
          dispatch(getPartInfo(newValue.value, () => { }))
        }))
      }

    } else {
      setPart([])
      dispatch(getPartInfo('', () => { }))
    }
  }

  /**
    * @method handleChange
    * @description Handle Effective Date
    */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  };

  /**
  * @method nextToggle
  * @description DISPLAY FORM ONCLICK NEXT BUTTON
  */
  const nextToggle = () => {
    setIsOpenVendorSOBDetails(true)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    dispatch(getPartInfo('', () => { }))
    reset()
  }

  //console.log('errors', errors)

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    console.log('values >>>', values);
  }

  return (
    <>

      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>
              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Col md="12">
                    <div className="left-border">
                      {'Part Details:'}
                    </div>
                  </Col>

                  <Col md="2">
                    <SearchableSelectHookForm
                      name={'Technology'}
                      label={'Technology'}
                      Controller={Controller}
                      control={control}
                      placeholder={'-Select-'}
                      defaultValue={''}
                      rules={{ required: true }}
                      register={register}
                      options={renderListing('Technology')}
                      mandatory={true}
                      handleChange={handleTechnologyChange}
                      //valueDescription={part}
                      errors={errors.Technology}
                    />
                  </Col>

                  <Col md="2">
                    <SearchableSelectHookForm
                      name={'Part'}
                      label={'Assembly No./Part No.'}
                      Controller={Controller}
                      control={control}
                      placeholder={'-Select-'}
                      defaultValue={''}
                      rules={{ required: true }}
                      register={register({ required: "Part Number is required." })}
                      options={renderListing('PartList')}
                      mandatory={true}
                      handleChange={handlePartChange}
                      //valueDescription={part}
                      errors={errors.Part}
                    />
                  </Col>

                  <Col md="2">
                    <TextFieldHookForm
                      label="Assembly Name/Part Name"
                      name={'PartName'}
                      Controller={Controller}
                      control={control}
                      //register={register({ required: "PartName is required." })} //Working for required and msg
                      register={register}
                      mandatory={false}
                      //rules={{ required: true, message: 'Required' }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PartName}
                      disabled={true}
                    />
                    <ErrorMessage errors={errors} name="PartName" />
                  </Col>

                  <Col md="2">
                    <TextFieldHookForm
                      label="Assembly/Part Description"
                      name={'Description'}
                      Controller={Controller}
                      control={control}
                      //register={register({ required: "Description is required." })}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Description}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2">
                    <TextFieldHookForm
                      label="ECO No."
                      name={'ECNNumber'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ECNNumber}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2">
                    <TextFieldHookForm
                      label="Drawing No."
                      name={'DrawingNumber'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.DrawingNumber}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2">
                    <TextFieldHookForm
                      label="Revision No."
                      name={'RevisionNumber'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RevisionNumber}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2">
                    <TextFieldHookForm
                      label="Price(Approved SOB)"
                      name={'SOB'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RevisionNumber}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2">
                    <div className="form-group">
                      <label>Effective Date</label>
                      <div className="inputbox date-section">
                        <DatePicker
                          name="EffectiveDate"
                          selected={effectiveDate}
                          onChange={handleEffectiveDateChange}
                          showMonthDropdown
                          showYearDropdown
                          dateFormat="dd/MM/yyyy"
                          //maxDate={new Date()}
                          dropdownMode="select"
                          placeholderText="Select date"
                          className="withBorder"
                          autoComplete={'off'}
                          disabledKeyboardNavigation
                          onChangeRaw={(e) => e.preventDefault()}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </Col>

                </Row>

                {!IsOpenVendorSOBDetails &&
                  <Row className="sf-btn-footer no-gutters justify-content-between">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        type={'button'}
                        className="reset mr15 cancel-btn"
                        onClick={cancel} >
                        <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Clear'}
                      </button>

                      <button
                        type="button"
                        className="submit-button mr5 save-btn"
                        onClick={nextToggle} >
                        <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                        {'Next'}
                      </button>
                    </div>
                  </Row>}

                {IsOpenVendorSOBDetails &&
                  <Row>
                    <Col md="12">
                      <div className="left-border">
                        {'Vendor & SOB Details:'}
                      </div>
                    </Col>
                  </Row>
                }

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                    </button>

                    <button
                      type="submit"
                      className="submit-button mr5 save-btn" >
                      <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {isEditFlag ? 'Update' : 'Save'}
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};


export default CostingDetails;