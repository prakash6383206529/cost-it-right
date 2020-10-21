import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getCostingTechnologySelectList, getAllPartSelectList, getPartInfo, checkPartWithTechnology, } from '../actions/Costing';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ErrorMessage } from '@hookform/error-message';
import AddPlantDrawer from './AddPlantDrawer';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import AddVendorDrawer from './AddVendorDrawer';

function CostingDetails() {

  const { register, handleSubmit, watch, control, setValue, reset, errors } = useForm();

  const [isEditFlag, setIsEditFlag] = useState(false);
  const [technology, setTechnology] = useState([]);
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
  const [part, setPart] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [IsOpenVendorSOBDetails, setIsOpenVendorSOBDetails] = useState(false);
  const [IsPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false);
  const [zbcPlantGrid, setZBCPlantGrid] = useState([]);
  const [IsVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);
  const [vbcVendorGrid, setVBCVendorGrid] = useState([]);

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
    dispatch(getPartInfo('', () => { }))
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
  * @method handleEffectiveDateChange
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
  * @method plantDrawerToggle
  * @description HANDLE ZBC PLANT DRAWER TOGGLE
  */
  const plantDrawerToggle = () => {
    setIsPlantDrawerOpen(true)
  };

  /**
  * @method closePlantDrawer
  * @description HIDE ZBC PLANT DRAWER
  */
  const closePlantDrawer = (e = '') => {
    setIsPlantDrawerOpen(false)
  }

  /**
  * @method vendorDrawerToggle
  * @description HANDLE VBC VENDOR DRAWER TOGGLE
  */
  const vendorDrawerToggle = () => {
    setIsVendorDrawerOpen(true)
  };

  /**
  * @method closePlantDrawer
  * @description HIDE ZBC PLANT DRAWER
  */
  const closeVendorDrawer = (e = '') => {
    setIsVendorDrawerOpen(false)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    setTechnology([])
    setPart([])
    dispatch(getPartInfo('', () => { }))
    reset({
      Technology: '',
      Part: '',
    })
  }

  console.log('errors', errors)

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
                      label={'Technology'}
                      name={'Technology'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={technology.length !== 0 ? technology : ''}
                      options={renderListing('Technology')}
                      mandatory={true}
                      handleChange={handleTechnologyChange}
                      errors={errors.Technology}
                    />
                  </Col>

                  <Col md="2">
                    <SearchableSelectHookForm
                      label={'Assembly No./Part No.'}
                      name={'Part'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={part.length !== 0 ? part : ''}
                      options={renderListing('PartList')}
                      mandatory={true}
                      handleChange={handlePartChange}
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
                      rules={{
                        required: false,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
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
                      register={register}
                      rules={{ required: false }}
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

                {IsOpenVendorSOBDetails &&
                  <Row>
                    <Col md="12">
                      <div className="left-border">
                        {'SOB Details:'}
                      </div>
                    </Col>
                  </Row>
                }
                {IsOpenVendorSOBDetails &&
                  <Row>
                    <Col md="3" className={'mb15 mt15'}>ZBC:</Col>
                    <Col md="7" className={'mb15 mt15'}></Col>
                    <Col md="2" className={'mb15 mt15'}>
                      <button
                        type="button"
                        className={'user-btn'}
                        onClick={plantDrawerToggle}>
                        <div className={'plus'}></div>ADD PLANT</button>
                    </Col>

                    {/* ZBC PLANT GRID FOR COSTING */}
                    <Col md="12">
                      <Table className="table" size="sm" >
                        <thead>
                          <tr>
                            <th>{`Plant Code`}</th>
                            <th>{`SOB`}</th>
                            <th>{`Costing Version`}</th>
                            <th>{`Status`}</th>
                            <th>{`Action`}</th>
                          </tr>
                        </thead>
                        <tbody >
                          {

                          }

                          {
                            zbcPlantGrid.length === 0 &&
                            <tr>
                              <td colSpan={'5'}>
                                <NoContentFound title={CONSTANT.EMPTY_DATA} />
                              </td>
                            </tr>
                          }
                        </tbody>
                      </Table>
                    </Col>

                  </Row>
                }

                {IsOpenVendorSOBDetails &&
                  <Row>
                    <Col md="3" className={'mb15 mt15'}>VBC:</Col>
                    <Col md="7" className={'mb15 mt15'}></Col>
                    <Col md="2" className={'mb15 mt15'}>
                      <button
                        type="button"
                        className={'user-btn'}
                        onClick={vendorDrawerToggle}>
                        <div className={'plus'}></div>ADD VENDOR</button>
                    </Col>

                    {/* ZBC PLANT GRID FOR COSTING */}
                    <Col md="12">
                      <Table className="table" size="sm" >
                        <thead>
                          <tr>
                            <th>{`Vendor`}</th>
                            <th>{`SOB`}</th>
                            <th>{`Costing Version`}</th>
                            <th>{`Status`}</th>
                            <th>{`Action`}</th>
                          </tr>
                        </thead>
                        <tbody >
                          {

                          }

                          {
                            vbcVendorGrid.length === 0 &&
                            <tr>
                              <td colSpan={'5'}>
                                <NoContentFound title={CONSTANT.EMPTY_DATA} />
                              </td>
                            </tr>
                          }
                        </tbody>
                      </Table>
                    </Col>

                  </Row>
                }

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



                <Row className="sf-btn-footer no-gutters justify-content-between">
                  {/* <div className="col-sm-12 text-right bluefooter-butn">
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
                  </div> */}
                </Row>
              </form>
            </div>
          </Col>
        </Row>
      </div>
      {IsPlantDrawerOpen && <AddPlantDrawer
        isOpen={IsPlantDrawerOpen}
        closeDrawer={closePlantDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
      {IsVendorDrawerOpen && <AddVendorDrawer
        isOpen={IsVendorDrawerOpen}
        closeDrawer={closeVendorDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
    </>
  );
};


export default CostingDetails;