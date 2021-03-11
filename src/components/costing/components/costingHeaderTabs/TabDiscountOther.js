import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import {
  getDiscountOtherCostTabData, saveDiscountOtherCostTab, fileUploadCosting, fileDeleteCosting,
  getExchangeRateByCurrency, setDiscountCost,
} from '../../actions/Costing';
import { getCurrencySelectList, } from '../../../../actions/Common';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL } from '../../../../config/constants';
import { toastr } from 'react-redux-toastr';

function TabDiscountOther(props) {

  const { DiscountTabData } = props;
  const { register, handleSubmit, setValue, getValues, errors, control } = useForm();

  const [IsCurrencyChange, setIsCurrencyChange] = useState(false);
  const [currency, setCurrency] = useState([]);
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState([]);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);
  const currencySelectList = useSelector(state => state.comman.currencySelectList)

  const fieldValues = useWatch({
    control,
    name: ['HundiOrDiscountPercentage'],
  });

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getDiscountOtherCostTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          if (Data && Data.CostingPartDetails && Data.CostingPartDetails.GrandTotalCost !== null) {
            let OtherCostDetails = Data.CostingPartDetails.OtherCostDetails;

            setIsCurrencyChange(OtherCostDetails.IsChangeCurrency ? true : false)
            setFiles(Data.Attachements ? Data.Attachements : [])
            setValue('HundiOrDiscountPercentage', OtherCostDetails.HundiOrDiscountPercentage !== null ? OtherCostDetails.HundiOrDiscountPercentage : '')
            setValue('OtherCostDescription', OtherCostDetails.OtherCostDescription !== null ? OtherCostDetails.OtherCostDescription : '')
            setValue('NetPOPriceINR', OtherCostDetails.NetPOPriceINR !== null ? OtherCostDetails.NetPOPriceINR : '')
            setValue('HundiOrDiscountValue', OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : '')
            setValue('AnyOtherCost', OtherCostDetails.AnyOtherCost !== null ? OtherCostDetails.AnyOtherCost : '')
            setValue('Currency', OtherCostDetails.Currency !== null ? { label: OtherCostDetails.Currency, value: OtherCostDetails.CurrencyId } : [])
            setValue('NetPOPriceOtherCurrency', OtherCostDetails.NetPOPriceOtherCurrency !== null ? OtherCostDetails.NetPOPriceOtherCurrency : '')
            setValue('Remarks', OtherCostDetails.Remark !== null ? OtherCostDetails.Remark : '')

            // BELOW CONDITION UPDATES VALUES IN EDIT OR GET MODE
            const discountValues = {
              NetPOPriceINR: checkForDecimalAndNull(OtherCostDetails.NetPOPriceINR !== null ? OtherCostDetails.NetPOPriceINR : '', 2),
              HundiOrDiscountValue: checkForDecimalAndNull(OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : '', 2),
              AnyOtherCost: checkForDecimalAndNull(OtherCostDetails.AnyOtherCost !== null ? OtherCostDetails.AnyOtherCost : '', 2),
            }
            dispatch(setDiscountCost(discountValues, () => { }))

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
      setValue('NetPOPriceINR', DiscountTabData && DiscountTabData.NetPOPriceINR)
      setValue('HundiOrDiscountValue', DiscountTabData && DiscountTabData.HundiOrDiscountValue)
    }, 500)
  }, [props]);

  /**
  * @method handleDiscountChange
  * @description HANDLE DISCOUNT CHANGE
  */
  const handleDiscountChange = (event) => {
    if (!isNaN(event.target.value)) {

      let topHeaderData = {
        DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
        HundiOrDiscountPercentage: checkForNull(event.target.value),
        AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
      }
      props.setHeaderCost(topHeaderData)

    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
  * @method handleAnyOtherCostChange
  * @description HANDLE ANY OTHER COST CHANGE
  */
  const handleAnyOtherCostChange = (event) => {
    if (!isNaN(event.target.value)) {

      let topHeaderData = {
        DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
        HundiOrDiscountPercentage: checkForNull(getValues('HundiOrDiscountPercentage')),
        AnyOtherCost: checkForNull(event.target.value),
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
      "CostingPartDetails": {
        "CostingDetailId": costData.CostingId,
        "PartId": costData.PartId,
        "PartTypeId": "00000000-0000-0000-0000-000000000000",
        "Type": costData.VendorType,
        "PartNumber": costData.PartNumber,
        "PartName": costData.PartName,
        "Quantity": 1,
        "IsOpen": true,
        "IsPrimary": true,
        "Sequence": 0,
        "TotalCost": values.NetPOPriceINR,
        "NetDiscountsAndOtherCost": values.HundiOrDiscountValue,
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
      },
      "Attachements": updatedFiles
    }

    dispatch(saveDiscountOtherCostTab(data, res => {
      console.log('saveDiscountOtherCostTab: ', res);
    }))
  }

  return (
    <>
      <div className="login-container signup-form">
        <div className="p-3 costing-border w-100 border-top-0">
          <Row>
            <Col md="12">
              <div className="shadow-lgg login-formg">
                {/* <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{""}</h2>
                  </div>
                </Col>
              </Row> */}

                <Row>
                  <Col md="12" className="pt-2">
                    <Table
                      className="table cr-brdr-main cr-bg-tbl mt-1"
                      size="sm"
                    >
                      <thead>
                        <tr>
                          <th className="fs1 font-weight-500 py-3" style={{ width: "33%" }}>{``}</th>
                          <th className="fs1 font-weight-500 py-3" style={{ width: "33%" }}>{``}</th>
                          <th className="fs1 font-weight-500 py-3" >{`Total Cost: ${DiscountTabData && DiscountTabData.HundiOrDiscountValue !== undefined ? DiscountTabData.HundiOrDiscountValue + DiscountTabData.AnyOtherCost : 0}`}</th>
                        </tr>
                      </thead>
                    </Table>
                  </Col>
                </Row>

                <form
                  noValidate
                  className="form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Row>
                    <Col md="4" >
                      <TextFieldHookForm
                        label="Hundi/Other Discount(%)"
                        name={"HundiOrDiscountPercentage"}
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
                          e.preventDefault();
                          handleDiscountChange(e);
                        }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.HundiOrDiscountPercentage}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4" >
                      <TextFieldHookForm
                        label="Other Cost Description"
                        name={"OtherCostDescription"}
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
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
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
                        mandatory={false}
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.NetPOPriceINR}
                        disabled={true}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md="4" >
                      <TextFieldHookForm
                        label="Hundi/Discount Value"
                        name={'HundiOrDiscountValue'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.HundiOrDiscountValue}
                        disabled={true}
                      />
                    </Col>
                    <Col md="4" >
                      <TextFieldHookForm
                        label="Any Other Cost"
                        name={"AnyOtherCost"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          //required: true,
                          pattern: {
                            value: /^[0-9]*$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={(e) => {
                          e.preventDefault();
                          handleAnyOtherCostChange(e);
                        }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.AnyOtherCost}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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

                      {IsCurrencyChange && (
                        <>
                          <SearchableSelectHookForm
                            label={"Select Currency"}
                            name={"Currency"}
                            placeholder={"-Select-"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={currency.length !== 0 ? currency : ""}
                            options={renderListing("Currency")}
                            mandatory={true}
                            handleChange={handleCurrencyChange}
                            errors={errors.Currency}
                            disabled={false}
                          />

                          <TextFieldHookForm
                            label={`Net PO Price${Object.keys(currency).length > 0 ? '(' + currency.label + ')' : ''}`}
                            name={'NetPOPriceOtherCurrency'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{}}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetPOPriceOtherCurrency}
                            disabled={true}
                          />
                        </>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <div className="bottom-border mb-0 mt-3">
                        {'Remarks & Attachments:'}
                      </div>
                    </Col>

                    <Col md="6">
                      <TextAreaHookForm
                        label="Remarks & Attachments:"
                        name={"Remarks"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        rows={6}
                        mandatory={false}
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.Remarks}
                        disabled={false}
                      />
                    </Col>

                    <Col md="3" className="height152-label">
                      <label>Upload Attachment ( upload up to 4 files )</label>
                      {files && files.length >= 4 ? (
                        <div class="alert alert-danger" role="alert">
                          Max file uploaded.
                        </div>
                      ) : (
                          <Dropzone
                            getUploadParams={getUploadParams}
                            onChangeStatus={handleChangeStatus}
                            PreviewComponent={Preview}
                            //onSubmit={this.handleSubmit}
                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                            initialFiles={initialFiles}
                            maxFiles={4}
                            maxSizeBytes={2000000}
                            inputContent={(files, extra) =>
                              extra.reject ? (
                                "Image, audio and video files only"
                              ) : (
                                  <div className="text-center">
                                    <i className="text-primary fa fa-cloud-upload"></i>
                                    <span className="d-block">
                                      Drag and Drop or{" "}
                                      <span className="text-primary">Browse</span>
                                      <br />
                                        file to upload
                                    </span>
                                  </div>
                                )
                            }
                            styles={{
                              dropzoneReject: {
                                borderColor: "red",
                                backgroundColor: "#DAA",
                              },
                              inputLabel: (files, extra) =>
                                extra.reject ? { color: "red" } : {},
                            }}
                            classNames="draper-drop"
                          />
                        )}
                    </Col>
                    <Col md="3">
                      <div className={"attachment-wrapper"}>
                        {files &&
                          files.map((f) => {
                            const withOutTild = f.FileURL.replace("~", "");
                            const fileURL = `${FILE_URL}${withOutTild}`;
                            return (
                              <div className={"attachment images"}>
                                <a href={fileURL} target="_blank">
                                  {f.OriginalFileName}
                                </a>
                                <img
                                  alt={""}
                                  className="float-right"
                                  onClick={() => deleteFile(f.FileId, f.FileName)}
                                  src={require("../../../../assests/images/red-cross.png")}
                                ></img>
                              </div>
                            );
                          })}
                      </div>
                    </Col>
                  </Row>


                  <Row className="no-gutters justify-content-between costing-disacount-other-cost-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                      <button
                        type={"submit"}
                        className="submit-button mr5 save-btn"
                      >
                        <div className={"check-icon"}>
                          <img
                            src={require("../../../../assests/images/check.png")}
                            alt="check-icon.jpg"
                          />{" "}
                        </div>
                        {"Save"}
                      </button>
                    </div>
                  </Row>

                </form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default React.memo(TabDiscountOther);