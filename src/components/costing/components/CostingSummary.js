import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import DatePicker from "react-datepicker";
import { toastr } from 'react-redux-toastr';
import moment from 'moment';

import AddToComparisonDrawer from './AddToComparisonDrawer'



import {
  getCostingTechnologySelectList, getAllPartSelectList, getPartInfo, checkPartWithTechnology, 
  storePartNumber
} from '../actions/Costing';

import { VBC, ZBC } from '../../../config/constants';
import { TextFieldHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';


import "react-datepicker/dist/react-datepicker.css";

function CostingSummary() {

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
   
  });
 
  const [technology, setTechnology] = useState([]);
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
  const [part, setPart] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [addComparisonToggle, setaddComparisonToggle] = useState(false)
 
  const fieldValues = useWatch({ control });

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCostingTechnologySelectList(() => { }))
    dispatch(getAllPartSelectList(() => { }))
    dispatch(getPartInfo('', () => { }))
  }, []);

  const technologySelectList = useSelector(state => state.costing.technologySelectList)
  const partSelectList = useSelector(state => state.costing.partSelectList)
  const partInfo = useSelector(state => state.costing.partInfo)

  /**
  * @method renderDropdownListing
  * @description Used show listing of unit of measurement
  */
  const renderDropdownListing = (label) => {

    const tempDropdownList = [];

    if (label === 'Technology') {
      technologySelectList && technologySelectList.map(item => {
        if (item.Value === '0') return false;
        tempDropdownList.push({ label: item.Text, value: item.Value })
        return null;
      });
      return tempDropdownList;
    }

    if (label === 'PartList') {
      partSelectList && partSelectList.map(item => {
        if (item.Value === '0') return false;
        tempDropdownList.push({ label: item.Text, value: item.Value })
        return null;
      });
      return tempDropdownList;
    }

  }



  /**
  * @method handleTechnologyChange
  * @description  USED TO HANDLE TECHNOLOGY CHANGE
  */
  const handleTechnologyChange = (newValue) => {
    if (newValue && newValue !== '') {
      dispatch(getPartInfo('', () => { }))
      setTechnology(newValue)
      setPart([])
      setIsTechnologySelected(true)
      dispatch(getPartInfo('', () => { }))
      setEffectiveDate('')
      reset({
        Part: '',
      })
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

      if (IsTechnologySelected) {
        const data = { TechnologyId: technology.value, PartId: newValue.value }

        dispatch(checkPartWithTechnology(data, (response) => {
          setPart(newValue)
          if (response.data.Result) {
            dispatch(getPartInfo(newValue.value, (res) => {
              let Data = res.data.Data;
              setValue('PartName', Data.PartName)
              setValue("Description", Data.Description)
              setValue("ECNNumber", Data.ECNNumber)
              setValue("DrawingNumber", Data.DrawingNumber)
              setValue("RevisionNumber", Data.RevisionNumber)
              setValue("ShareOfBusiness", Data.Price)
              setEffectiveDate(moment(Data.EffectiveDate)._d)
              dispatch(storePartNumber(newValue))
            }))
          } else {
            dispatch(getPartInfo('', () => { }))
            setValue('PartName', '')
            setValue("Description", '')
            setValue("ECNNumber", '')
            setValue("DrawingNumber", '')
            setValue("RevisionNumber", '')
            setValue("ShareOfBusiness", '')
            setEffectiveDate('')
          }
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
  * @method checkForError
  * @description HANDLE COSTING VERSION SELECTED
  */
  const checkForError = (index, type) => {
    if (errors && (errors.zbcPlantGridFields || errors.vbcGridFields)) {
      return false;
    } else {
      return true;
    }
  }

  /**
  * @method warningMessageHandle
  * @description VIEW COSTING DETAILS IN READ ONLY MODE
  */
  const warningMessageHandle = (warningType) => {
    switch (warningType) {
      case 'SOB_WARNING':
        toastr.warning('SOB Should not be greater than 100.');
        break;
      case 'COSTING_VERSION_WARNING':
        toastr.warning('Please select a costing version.');
        break;
      case 'VALID_NUMBER_WARNING':
        toastr.warning('Please enter a valid number.');
        break;
      case 'ERROR_WARNING':
        toastr.warning('Please enter a valid number.');
        break;
      default:
        break;
    }
  }

/**
* @method addComparisonDrawerToggle
* @description HANDLE ADD TO COMPARISON DRAWER TOGGLE
*/
  const addComparisonDrawerToggle = () => {
     setaddComparisonToggle(true)
  }

 /**
  * @method closeAddComparisonDrawer
  * @description HIDE ADD COMPARISON DRAWER
  */
  const closeAddComparisonDrawer = (e = '') => {

    // if (Object.keys(plantData).length > 0) {
    //   let tempArr = [...zbcPlantGrid, plantData]
    //   setZBCPlantGrid(tempArr)
    // }
    setaddComparisonToggle(false)

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  // const onSubmit = (values) => {

  // }

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
              <form noValidate className="form" onSubmit={handleSubmit(() => {} )} >
                {
                  <>
                    <Row>
                      <Col md="12">
                        <div className="left-border">
                          {'Part Details:'}
                        </div>
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Technology'}
                          name={'Technology'}
                          placeholder={'-Select-'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={technology.length !== 0 ? technology : ''}
                          options={renderDropdownListing('Technology')}
                          mandatory={true}
                          handleChange={handleTechnologyChange}
                          errors={errors.Technology}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Assembly No./Part No.'}
                          name={'Part'}
                          placeholder={'-Select-'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={part.length !== 0 ? part : ''}
                          options={renderDropdownListing('PartList')}
                          mandatory={true}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly Name/Part Name"
                          name={'PartName'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: false
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.PartName}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly/Part Description"
                          name={'Description'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{ required: false }}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.Description}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="ECO No."
                          name={'ECNNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ECNNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Drawing No."
                          name={'DrawingNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.DrawingNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Revision No."
                          name={'RevisionNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.RevisionNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Price(Approved SOB)"
                          name={'ShareOfBusiness'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ShareOfBusiness}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
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
                        <button
                            type="button"
                            className={'user-btn'}
                            onClick={addComparisonDrawerToggle}>
                            <div className={'plus'}></div>ADD Comparison</button>
                    </Row>
                  </>}
              </form>
            </div>
          </Col>
        </Row>
      </div>
      {
         addComparisonToggle && 
         <AddToComparisonDrawer 
          part = {part}
          isOpen = {addComparisonToggle}
          closeDrawer = {closeAddComparisonDrawer}
          isEditFlag = {false}
          anchor = {'right'}
          />
      }
    </>
  );
};


export default CostingSummary;