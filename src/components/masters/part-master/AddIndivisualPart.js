import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength512 } from "../../../helper/validation";
import { loggedInUserId } from "../../../helper/auth";
import { renderText, renderTextAreaField, } from "../../layout/FormInputs";
import { createPart, updatePart, getPartData, fileUploadPart, fileDeletePart, } from '../actions/Part';
import { getPlantSelectList, } from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL } from '../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';

class AddIndivisualPart extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      isLoader: false,
      PartId: '',

      selectedPlants: [],
      effectiveDate: '',

      files: [],
    }
  }

  /**
  * @method componentDidMount
  * @description 
  */
  componentDidMount() {
    this.props.getPlantSelectList(() => { })
    this.getDetails()
  }

  /**
  * @method getDetails
  * @description 
  */
  getDetails = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        PartId: data.Id,
      })
      this.props.getPartData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;

          let plantArray = Data && Data.Plants.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))

          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              isLoader: false,
              selectedPlants: plantArray,
              effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
              files: Data.Attachements,
            })
          }, 500)
        }
      })
    } else {
      this.props.getPartData('', res => { })
    }
  }

  /**
  * @method handlePlant
  * @description Used handle plants
  */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: date, });
  };

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { plantSelectList } = this.props;
    const temp = [];
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
      });
      return temp;
    }

  }


  // specify upload params and url for your files
  getUploadParams = ({ file, meta }) => {
    return { url: 'https://httpbin.org/post', }

  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files, } = this.state;

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadPart(data, (res) => {
        let Data = res.data[0]
        const { files } = this.state;
        files.push(Data)
        this.setState({ files: files })
      })
    }

    if (status === 'rejected_file_type') {
      toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
    }
  }

  renderImages = () => {
    this.state.files && this.state.files.map(f => {
      const withOutTild = f.FileURL.replace('~', '')
      const fileURL = `${FILE_URL}${withOutTild}`;
      return (
        <div className={'attachment-wrapper images'}>
          <img src={fileURL} alt={''} />
          <button
            type="button"
            onClick={() => this.deleteFile(f.FileId)}>X</button>
        </div>
      )
    })
  }

  deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      this.props.fileDeletePart(deleteData, (res) => {
        toastr.success('File has been deleted successfully.')
        let tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
      this.setState({ files: tempArr })
    }
  }

  Preview = ({ meta }) => {
    const { name, percent, status } = meta
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  /**
 * @method cancel
 * @description used to Reset form
 */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      RawMaterial: [],
      selectedPlants: [],
    })
    this.props.getPartData('', res => { })
    this.props.hideForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { PartId, selectedPlants, effectiveDate, isEditFlag, files } = this.state;

    let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

    if (isEditFlag) {
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: PartId }
      })
      let updateData = {
        LoggedInUserId: loggedInUserId(),
        PartId: PartId,
        PartName: values.PartName,
        PartNumber: values.PartNumber,
        Description: values.Description,
        ECNNumber: values.ECNNumber,
        RevisionNumber: values.RevisionNumber,
        DrawingNumber: values.DrawingNumber,
        GroupCode: values.GroupCode,
        Remark: values.Remark,
        EffectiveDate: effectiveDate,
        Plants: plantArray,
        Attachements: updatedFiles
      }

      this.props.updatePart(updateData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.UPDATE_PART_SUCESS);
          this.cancel()
        }
      });

    } else {

      let formData = {
        LoggedInUserId: loggedInUserId(),
        BOMNumber: values.BOMNumber,
        BOMLevel: 0,
        Quantity: 1,
        Remark: values.Remark,
        PartNumber: values.PartNumber,
        PartName: values.PartName,
        Description: values.Description,
        ECNNumber: values.ECNNumber,
        EffectiveDate: effectiveDate,
        RevisionNumber: values.RevisionNumber,
        DrawingNumber: values.DrawingNumber,
        GroupCode: values.GroupCode,
        Plants: plantArray,
        Attachements: files
      }

      this.props.createPart(formData, (res) => {
        if (res.data.Result === true) {
          toastr.success(MESSAGES.PART_ADD_SUCCESS);
          this.cancel()
        }
      });
    }
  }



  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isEditFlag, } = this.state;
    return (
      <>
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <Row>
                <Col md="12">
                  <div className="shadow-lgg login-formg">
                    <Row>
                      <Col md="6">
                        <div className="form-heading mb-0">
                          <h1>
                            {this.state.isEditFlag
                              ? "Update Component/ Part"
                              : "Add  Component/ Part"}
                          </h1>
                        </div>
                      </Col>
                    </Row>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    >
                      <div className="add-min-height">
                        <Row>
                          <Col md="3">
                            <Field
                              label={`Part No.`}
                              name={"PartNumber"}
                              type="text"
                              placeholder={""}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
                              component={renderText}
                              required={true}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Part Name`}
                              name={"PartName"}
                              type="text"
                              placeholder={""}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
                              component={renderText}
                              required={true}
                              className=""
                              customClassName={"withBorder"}
                            />
                          </Col>
                          {/* {initialConfiguration &&
                            initialConfiguration.IsBOMNumberDisplay && (
                              <Col md="3">
                                <Field
                                  label={`BOM No.`}
                                  name={"BOMNumber"}
                                  type="text"
                                  placeholder={""}
                                  validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
                                  component={renderText}
                                  required={true}
                                  className=""
                                  customClassName={"withBorder"}
                                  disabled={isEditFlag ? true : false}
                                />
                              </Col>
                            )} */}
                          <Col md="3">
                            <Field
                              label={`Part Description`}
                              name={"Description"}
                              type="text"
                              placeholder={""}
                              validate={[required, maxLength80, checkWhiteSpaces]}
                              component={renderText}
                              required={true}
                              className=""
                              customClassName={"withBorder"}
                            />
                          </Col>
                        </Row>

                        <Row>
                          <Col md="3">
                            <Field
                              label={`ECN No.`}
                              name={"ECNNumber"}
                              type="text"
                              placeholder={""}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
                              component={renderText}
                              //required={true}
                              className=""
                              customClassName={"withBorder"}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Revision No.`}
                              name={"RevisionNumber"}
                              type="text"
                              placeholder={""}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
                              component={renderText}
                              //required={true}
                              className=""
                              customClassName={"withBorder"}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Drawing No.`}
                              name={"DrawingNumber"}
                              type="text"
                              placeholder={""}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
                              component={renderText}
                              //required={true}
                              className=""
                              customClassName={"withBorder"}
                            />
                          </Col>
                          {initialConfiguration &&
                            initialConfiguration.IsGroupCodeDisplay && (
                              <Col md="3">
                                <Field
                                  label={`Group Code`}
                                  name={"GroupCode"}
                                  type="text"
                                  placeholder={""}
                                  validate={[checkWhiteSpaces, alphaNumeric, maxLength20]}
                                  component={renderText}
                                  //required={true}
                                  className=""
                                  customClassName={"withBorder"}
                                />
                              </Col>
                            )}
                        </Row>

                        <Row>
                          {/* <Col md="3">
                            <Field
                              label="Plant"
                              name="Plant"
                              placeholder={"Select"}
                              selection={
                                this.state.selectedPlants == null ||
                                  this.state.selectedPlants.length === 0
                                  ? []
                                  : this.state.selectedPlants
                              }
                              options={this.renderListing("plant")}
                              selectionChanged={this.handlePlant}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              component={renderMultiSelectField}
                              //mendatory={true}
                              className="multiselect-with-border"
                            //disabled={isEditFlag ? true : false}
                            />
                          </Col> */}

                          <Col md="3">
                            <div className="form-group">
                              <label>
                                Effective Date
                                    <span className="asterisk-required">*</span>
                              </label>
                              <div className="inputbox date-section">
                                <DatePicker
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  dateFormat="dd/MM/yyyy"
                                  //maxDate={new Date()}
                                  dropdownMode="select"
                                  placeholderText="Select date"
                                  className="withBorder"
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={false}
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">
                              {"Remarks & Attachments:"}
                            </div>
                          </Col>
                          <Col md="6">
                            <Field
                              label={"Remarks"}
                              name={`Remark`}
                              placeholder="Type here..."
                              className=""
                              customClassName=" textAreaWithBorder"
                              validate={[maxLength512, checkWhiteSpaces]}
                              //required={true}
                              component={renderTextAreaField}
                              maxLength="5000"
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (upload up to 3 files)
                                </label>
                            {this.state.files &&
                              this.state.files.length >= 3 ? (
                                <div class="alert alert-danger" role="alert">
                                  Max file uploaded.
                                </div>
                              ) : (
                                <Dropzone
                                  getUploadParams={this.getUploadParams}
                                  onChangeStatus={this.handleChangeStatus}
                                  PreviewComponent={this.Preview}
                                  //onSubmit={this.handleSubmit}
                                  accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                                  initialFiles={this.state.initialFiles}
                                  maxFiles={3}
                                  maxSizeBytes={2000000}
                                  inputContent={(files, extra) =>
                                    extra.reject ? (
                                      "Image, audio and video files only"
                                    ) : (
                                        <div className="text-center">
                                          <i className="text-primary fa fa-cloud-upload"></i>
                                          <span className="d-block">
                                            Drag and Drop or{" "}
                                            <span className="text-primary">
                                              Browse
                                            </span>
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
                              {this.state.files &&
                                this.state.files.map((f) => {
                                  const withOutTild = f.FileURL.replace(
                                    "~",
                                    ""
                                  );
                                  const fileURL = `${FILE_URL}${withOutTild}`;
                                  return (
                                    <div className={"attachment images"}>
                                      <a href={fileURL} target="_blank">
                                        {f.OriginalFileName}
                                      </a>
                                      {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                      {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                      <img
                                        alt={""}
                                        className="float-right"
                                        onClick={() =>
                                          this.deleteFile(
                                            f.FileId,
                                            f.FileName
                                          )
                                        }
                                        src={require("../../../assests/images/red-cross.png")}
                                      ></img>
                                    </div>
                                  );
                                })}
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="reset mr15 cancel-btn"
                            onClick={this.cancel}
                          >
                            <div className={"cross-icon"}>
                              <img
                                src={require("../../../assests/images/times.png")}
                                alt="cancel-icon.jpg"
                              />
                            </div>{" "}
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="submit-button mr5 save-btn"
                          >
                            <div className={"check-icon"}>
                              <img
                                src={require("../../../assests/images/check.png")}
                                alt="check-icon.jpg"
                              />{" "}
                            </div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        </div>
                      </Row>
                    </form>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, part, auth }) {
  const { plantSelectList, } = comman;
  const { partData } = part;
  const { initialConfiguration } = auth;

  let initialValues = {};
  if (partData && partData !== undefined) {
    initialValues = {
      PartNumber: partData.PartNumber,
      PartName: partData.PartName,
      BOMNumber: partData.BOMNumber,
      Description: partData.Description,
      GroupCode: partData.GroupCode,
      ECNNumber: partData.ECNNumber,
      DrawingNumber: partData.DrawingNumber,
      RevisionNumber: partData.RevisionNumber,
      Remark: partData.Remark,
    }
  }

  return { plantSelectList, partData, initialValues, initialConfiguration, }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getPlantSelectList,
  createPart,
  updatePart,
  getPartData,
  fileUploadPart,
  fileDeletePart,
})(reduxForm({
  form: 'AddIndivisualPart',
  enableReinitialize: true,
})(AddIndivisualPart));
