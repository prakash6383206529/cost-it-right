import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getOverheadProfitTabData, saveCostingOverheadProfitTab, } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL } from '../../../../config/constants';
import { toastr } from 'react-redux-toastr';

function TabDiscountOther(props) {

  const { register, handleSubmit, setValue, getValues, reset, errors, control } = useForm();

  const [tabData, setTabData] = useState([]);
  const [IsCurrencyChange, setIsCurrencyChange] = useState(false);
  const [currency, setCurrency] = useState([]);
  const [files, setFiles] = useState([]);
  const [initialFiles, setInitialFiles] = useState([]);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      dispatch(getOverheadProfitTabData(data, (res) => {
        // console.log('res: >>>>>>>>> ', res);
        // if (res && res.data && res.data.Result) {
        //   let Data = res.data.Data;
        //   setTabData(Data.CostingPartDetails)
        // }
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {

  }, [tabData]);


  /**
  * @method onPressChangeCurrency
  * @description TOGGLE CURRENCY CHANGE
  */
  const onPressChangeCurrency = () => {
    setIsCurrencyChange(!IsCurrencyChange)
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    if (label === 'Currency') {
      return [
        { label: 'INR', value: 'INR' },
      ];
    }

  }

  /**
    * @method handleCurrencyChange
    * @description  RATE CRITERIA CHANGE HANDLE
    */
  const handleCurrencyChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCurrency(newValue)
    } else {
      setCurrency([])
    }
  }


  // specify upload params and url for your files
  const getUploadParams = ({ file, meta }) => {
    return { url: 'https://httpbin.org/post', }

  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
      setFiles(tempArr)
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      // dispatch(fileUploadBOPDomestic(data, (res) => {
      //   let Data = res.data[0]
      //   const { files } = this.state;
      //   files.push(Data)
      //   setFiles(files)
      // }))
    }

    if (status === 'rejected_file_type') {
      toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
    }
  }

  const renderImages = () => {
    this.state.files && this.state.files.map(f => {
      const withOutTild = f.FileURL.replace('~', '')
      const fileURL = `${FILE_URL}${withOutTild}`;
      return (
        <div className={'attachment-wrapper images'}>
          <img src={fileURL} alt={''} />
          <button
            type="button"
            onClick={() => deleteFile(f.FileId)}>X</button>
        </div>
      )
    })
  }

  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      // dispatch(fileDeleteBOPDomestic(deleteData, (res) => {
      //   toastr.success('File has been deleted successfully.')
      //   let tempArr = this.state.files.filter(item => item.FileId !== FileId)
      //   setFiles(tempArr)
      // }))
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
      setFiles(tempArr)
    }
  }

  const Preview = ({ meta }) => {
    const { name, percent, status } = meta
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    console.log('values: ', values);
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

              <Row>

              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Hundi/Other Discount(%)"
                      name={'HundiPerOtherDiscount'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.HundiPerOtherDiscount}
                      disabled={false}
                    />
                  </Col>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Other Cost Description"
                      name={'OtherCostDescription'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OtherCostDescription}
                      disabled={false}
                    />
                  </Col>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Net PO Price(INR)"
                      name={'NetPOPrice'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.NetPOPrice}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Hundi/Discount Value"
                      name={'HundiPerDiscount'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.HundiPerDiscount}
                      disabled={true}
                    />
                  </Col>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Any Other Cost"
                      name={'AnyOtherCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        //required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.AnyOtherCost}
                      disabled={false}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md="4" className="mb15">
                    <label
                      className={`custom-checkbox`}
                      onChange={onPressChangeCurrency}
                    >
                      Change Currency
                      <input
                        type="checkbox"
                        checked={IsCurrencyChange}
                        disabled={false}
                      />
                      <span
                        className=" before-box"
                        checked={IsCurrencyChange}
                        onChange={onPressChangeCurrency}
                      />
                    </label>
                  </Col>

                  {IsCurrencyChange &&
                    <>
                      <Col md="4">
                        <SearchableSelectHookForm
                          label={'Select Currency'}
                          name={'Currency'}
                          placeholder={'-Select-'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={currency.length !== 0 ? currency : ''}
                          options={renderListing('Currency')}
                          mandatory={true}
                          handleChange={handleCurrencyChange}
                          errors={errors.Currency}
                          disabled={false}
                        />
                      </Col>
                      <Col md="4">
                        <TextFieldHookForm
                          label="Net PO Price(INR)"
                          name={'NetPOPriceCurrency'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{
                            required: true,
                            // pattern: {
                            //   value: /^[0-9]*$/i,
                            //   message: 'Invalid Number.'
                            // },
                            // maxLength: 4,
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.NetPOPriceCurrency}
                          disabled={true}
                        />
                      </Col>
                    </>}
                </Row>

                <Row>
                  <Col md="12">
                    <div className="left-border">
                      {'Remark & Attachments'}
                    </div>
                  </Col>

                  <Col md="6">
                    <TextAreaHookForm
                      label="Remarks & Attachments"
                      name={'Remarks'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        //required: true,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Remarks}
                      disabled={false}
                    />
                  </Col>

                  <Col md="3">
                    <label>Upload Files (upload up to 3 files)</label>
                    {files && files.length >= 3 ? '' :
                      <Dropzone
                        getUploadParams={getUploadParams}
                        onChangeStatus={handleChangeStatus}
                        PreviewComponent={Preview}
                        //onSubmit={this.handleSubmit}
                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                        initialFiles={initialFiles}
                        maxFiles={3}
                        maxSizeBytes={2000000}
                        inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                        styles={{
                          dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                          inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                        }}
                        classNames="draper-drop"
                      />}
                  </Col>
                  <Col md="3">
                    <div className={'attachment-wrapper'}>
                      {
                        files && files.map(f => {
                          const withOutTild = f.FileURL.replace('~', '')
                          const fileURL = `${FILE_URL}${withOutTild}`;
                          return (
                            <div className={'attachment images'}>
                              <a href={fileURL} target="_blank">{f.OriginalFileName}</a>
                              {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                              {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                              <img alt={''} className="float-right" onClick={() => deleteFile(f.FileId, f.FileName)} src={require('../../../../assests/images/red-cross.png')}></img>
                            </div>
                          )
                        })
                      }
                    </div>
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    <button
                      type={'submit'}
                      className="submit-button mr5 save-btn" >
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
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

export default TabDiscountOther;