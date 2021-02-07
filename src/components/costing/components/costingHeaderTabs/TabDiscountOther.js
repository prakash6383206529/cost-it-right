import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import {
  getDiscountOtherCostTabData, saveDiscountOtherCostTab, fileUploadCosting, fileDeleteCosting,
  getExchangeRateByCurrency
} from '../../actions/Costing';
import { getCurrencySelectList, } from '../../../../actions/Common';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL } from '../../../../config/constants';
import { toastr } from 'react-redux-toastr';

function TabDiscountOther(props) {

  const { DiscountTabData } = props;
  const { register, handleSubmit, setValue, getValues, reset, errors, control } = useForm();

  const [tabData, setTabData] = useState({});
  const [IsCurrencyChange, setIsCurrencyChange] = useState(false);
  const [currency, setCurrency] = useState([]);
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState([]);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  const fieldValues = useWatch({
    control,
    name: ['HundiOrDiscountPercentage'],
  });

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      dispatch(getDiscountOtherCostTabData(data, (res) => {
        console.log('res: >>>>>>>>> ddddddd ', res);
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          //setTabData(Data)
          if (Data && Data.CostingPartDetails[0] && Data.CostingPartDetails[0].DiscountCost !== null) {
            let OtherCostDetails = Data.CostingPartDetails[0].OtherCostDetails;
            setCurrency(OtherCostDetails.IsCurrencyChange ? true : false)
            setValue([
              { HundiOrDiscountPercentage: OtherCostDetails.HundiOrDiscountPercentage !== null ? OtherCostDetails.HundiOrDiscountPercentage : '' },
              { OtherCostDescription: OtherCostDetails.OtherCostDescription !== null ? OtherCostDetails.OtherCostDescription : '' },
              { NetPOPriceINR: OtherCostDetails.NetPOPriceINR !== null ? OtherCostDetails.NetPOPriceINR : '' },
              { HundiOrDiscountValue: OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : '' },
              { AnyOtherCost: OtherCostDetails.AnyOtherCost !== null ? OtherCostDetails.AnyOtherCost : '' },
              { Currency: OtherCostDetails.Currency !== null ? { label: '', value: '' } : [] },
              { NetPOPriceAfterCurrencyChange: OtherCostDetails.NetPOPriceAfterCurrencyChange !== null ? OtherCostDetails.NetPOPriceAfterCurrencyChange : '' },
            ])
          }
        }
      }))
    }
  }, [costData]);

  useEffect(() => {
    dispatch(getCurrencySelectList(() => { }))
  }, [])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    const { DiscountTabData } = props;
    setTimeout(() => {
      setValue('NetPOPriceINR', DiscountTabData.NetPOPriceINR)
      setValue('HundiOrDiscountValue', DiscountTabData.HundiOrDiscountValue)
    }, 500)
  }, [props]);

  const currencySelectList = useSelector(state => state.comman.currencySelectList)

  /**
  * @method handleDiscountChange
  * @description HANDLE DISCOUNT CHANGE
  */
  const handleDiscountChange = (event) => {
    if (!isNaN(event.target.value)) {

      let topHeaderData = {
        //DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
        HundiOrDiscountPercentage: checkForNull(event.target.value),
      }
      props.setHeaderCost(topHeaderData)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }


  /**
  * @method onPressChangeCurrency
  * @description TOGGLE CURRENCY CHANGE
  */
  const onPressChangeCurrency = () => {
    setCurrency([])
    setIsCurrencyChange(!IsCurrencyChange)
  }

  /**
    * @method handleCurrencyChange
    * @description  RATE CRITERIA CHANGE HANDLE
    */
  const handleCurrencyChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCurrency(newValue)
      dispatch(getExchangeRateByCurrency(newValue.label, res => {
        let Data = res.data.Data;
        const NetPOPriceINR = getValues('NetPOPriceINR');
        setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((NetPOPriceINR / Data.CurrencyExchangeRate), 2))
      }))
    } else {
      setCurrency([])
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'Currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0' || item.Text === 'INR') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
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
      setIsOpen(!IsOpen)
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      dispatch(fileUploadCosting(data, (res) => {
        let Data = res.data[0]
        files.push(Data)
        setFiles(files)
        setIsOpen(!IsOpen)
      }))
    }

    if (status === 'rejected_file_type') {
      toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
    }
  }

  const renderImages = () => {
    files && files.map(f => {
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
      dispatch(fileDeleteCosting(deleteData, (res) => {
        toastr.success('File has been deleted successfully.')
        let tempArr = files && files.filter(item => item.FileId !== FileId)
        setFiles(tempArr)
        setIsOpen(!IsOpen)
      }))
    }
    if (FileId == null) {
      let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
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
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: costData.CostingId }
    })
    let data = {
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": props.netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      "NetOtherCostCost": 0,
      "CostingPartDetails": [
        {
          "CostingDetailId": costData.CostingId,
          "PartId": costData.PartId,
          "PartTypeId": "00000000-0000-0000-0000-000000000000",
          "Type": costData.VendorType,
          "PartNumber": costData.PartNumber,
          "PartName": costData.PartName,
          "Quantity": 0,
          "GrandTotalCost": 0,
          "IsOpen": true,
          "IsPrimary": true,
          "Sequence": 0,
          "NetOtherCost": values.TotalOtherCost,
          "OtherCost": values.AnyOtherCost,
          "DiscountCost": values.HundiOrDiscountValue,
          "OtherCostDetails": {
            "OtherCostDetailId": '',
            "HundiOrDiscountPercentage": values.HundiOrDiscountPercentage,
            "HundiOrDiscountValue": values.HundiOrDiscountValue,
            "AnyOtherCost": values.AnyOtherCost,
            "OtherCostPercentage": values.OtherCostPercentage,
            "TotalOtherCost": values.TotalOtherCost,
            "TotalDiscount": values.TotalDiscount,
            "IsChangeCurrency": IsCurrencyChange,
            "NetPOPriceINR": values.NetPOPriceINR,
            "NetPOPriceOtherCurrency": values.NetPOPriceOtherCurrency,
            "CurrencyId": currency.value,
            "Currency": currency.label,
            "Remark": values.Remarks,
            "OtherCostDescription": values.OtherCostDescription,
          }
        }
      ],
      "Attachements": updatedFiles
    }

    dispatch(saveDiscountOtherCostTab(data, res => {
      console.log('saveDiscountOtherCostTab: ', res);
    }))
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
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{``}</th>
                        <th>{``}</th>
                        <th>{``}</th>
                        <th>{``}</th>
                        <th>{``}</th>
                        <th>{``}</th>
                        <th>{`Total Cost: ${DiscountTabData.HundiOrDiscountValue}`}</th>
                      </tr>
                    </thead>
                  </Table>
                </Col>
              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Hundi/Other Discount(%)"
                      name={'HundiOrDiscountPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleDiscountChange(e)
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.HundiOrDiscountPercentage}
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
                      name={'NetPOPriceINR'}
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
                      errors={errors.NetPOPriceINR}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Hundi/Discount Value"
                      name={'HundiOrDiscountValue'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
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
                      errors={errors.HundiOrDiscountValue}
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
                  <Col md="2" className="mb15">
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

                  <Col md="2" ></Col>

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
                          label={`Net PO Price${Object.keys(currency).length > 0 ? '(' + currency.label + ')' : ''}`}
                          name={'NetPOPriceOtherCurrency'}
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
                          errors={errors.NetPOPriceOtherCurrency}
                          disabled={true}
                        />
                      </Col>
                    </>}
                </Row>

                <Row>
                  <Col md="12">
                    <div className="left-border">
                      {'Remarks & Attachments'}
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
                    {files && files.length >= 8 ? '' :
                      <Dropzone
                        getUploadParams={getUploadParams}
                        onChangeStatus={handleChangeStatus}
                        PreviewComponent={Preview}
                        //onSubmit={this.handleSubmit}
                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                        initialFiles={initialFiles}
                        maxFiles={8}
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