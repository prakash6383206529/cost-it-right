import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { getJsDateFromExcel } from "../../helper/validation";
import { BOMUploadPart } from '../masters/actions/Part';
import Toaster from '../common/Toaster';
import { loggedInUserId } from "../../helper/auth";
import { ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import DownloadUploadBOMxls, { checkSAPCodeinExcel } from './DownloadUploadBOMxls';
import cloudImg from '../../assests/images/uploadcloud.png';
import DayTime from '../common/DayTimeWrapper';
import { BOMBULKUPLOAD } from '../../config/constants';
import { checkForSameFileUpload } from '../../helper';
import { BOMUpload } from '../../config/masterData';
import LoaderCustom from '../common/LoaderCustom';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import { localizeHeadersWithLabels } from '../../helper/core';
import { withTranslation } from 'react-i18next';

class BOMUploadDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cols: [],
      rows: [],
      fileData: [],
      setDisable: false,
      faildRecords: false,
      failedData: [],
      uploadfileName: "",
      bomUploadLoader: false,
      showPopup: false
    }
    this.localizeHeaders = this.localizeHeaders.bind(this);

  }
  

  localizeHeaders(headers) {
    return localizeHeadersWithLabels(headers, this.props.t);
  }
  /**
  * @method toggleModel
  * @description Used to cancel modal
  */
  toggleModel = () => {
    this.props.onCancel();
  }

  toggleDrawer = (event, isCancel) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.props.closeDrawer(isCancel)
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.toggleDrawer('', true)
  }
  getValueFromMasterData(keyName, masterDataArray) {
    const matchingItem = masterDataArray.find(item => item.label === keyName);
    return matchingItem ? matchingItem.value : keyName;
}
  /**
   * @method fileChangedHandler
   * @description called for profile pic change
   */
  fileHandler = event => {
    this.setState({ bomUploadLoader: true })
    let fileObj = event.target.files[0];
    let fileHeads = [];
    let uploadfileName = fileObj?.name;
    let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));
    let masterDataArray = [];
    //pass the fileObj as parameter
    if (fileType !== '.xls' && fileType !== '.xlsx') {
      Toaster.warning('File type should be .xls or .xlsx')
      this.setState({ bomUploadLoader: false })
    } else {

      let data = new FormData()
      data.append('file', fileObj)

      ExcelRenderer(fileObj, (err, resp) => {
        if (err) {

        } else {

          fileHeads = resp.rows[0];
          // fileHeads = ["SerialNumber", "BillNumber"]
          let checkForFileHead
          let fileData = [];
          switch (String(this.props.fileName)) {
            case String(BOMBULKUPLOAD):
              console.log(BOMUpload);
              const localizedBOMUpload = this.localizeHeaders(checkSAPCodeinExcel(BOMUpload));
              masterDataArray = localizedBOMUpload
              checkForFileHead = checkForSameFileUpload(localizedBOMUpload, fileHeads)
              break;
            default:
              break;
          }
          this.setState({ bomUploadLoader: false })
          if (!checkForFileHead) {
            Toaster.warning('Please select file of same Master')
            return false
          }
          resp.rows.map((val, index) => {
            if (val === []) return false
            if (index > 0 && val?.length > 0) {

              // BELOW CODE FOR HANDLE EMPTY CELL VALUE
              const i = val.findIndex(e => e === undefined);
              if (i !== -1) {
                val[i] = '';
              }

              let obj = {}
              val.map((el, i) => {
                if ((fileHeads[i] === 'EffectiveDate') && typeof el === 'string') {
                  el = (DayTime(Date(el))).format('YYYY-MM-DD 00:00:00')
                }
                if (fileHeads[i] === 'EffectiveDate' && typeof el == 'number') {
                  el = getJsDateFromExcel(el)
                }
                const key = this.getValueFromMasterData(fileHeads[i], masterDataArray)

                obj[key] = el;
                return null;
              })
              fileData.push(obj)
              obj = {}
            }
            return null;
          })

          this.setState({
            cols: resp.cols,
            rows: resp.rows,
            fileData: fileData,
            uploadfileName: uploadfileName,
          });

        }
      });
    }
  }

  responseHandler = (res) => {
    if (res?.data) {
      let Data = res?.data?.Data;
      if (Data[0]?.CountSucceeded > 0) {
        Toaster.success(`${Data[0].CountSucceeded} BOM uploaded successfully`)
      }
      if (Data[0]?.CountFailed > 0) {
        Toaster.warning(res.data.Message);
        this.setState({
          failedData: Data[0].FailedRecords,
          faildRecords: true,
        })
      }
    }
    this.toggleDrawer('', false)
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { fileData } = this.state;
    const { fileName } = this.props;
    if (fileData.length === 0) {
      Toaster.warning('Please select a file to upload.')
      return false
    }

    let uploadData = {
      Records: fileData,
      IsMultipleUpload: true,
      LoggedInUserId: loggedInUserId(),
    }
    this.setState({ setDisable: true })
    if (fileName === 'BOM') {
      this.props.BOMUploadPart(uploadData, (res) => {
        this.setState({ setDisable: false })
        this.responseHandler(res)
      });
    }
  }
  cancelHandler = () => {
    this.cancel('cancel')
    // this.setState({ showPopup: true })
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
     getValueFromMasterData(keyName, masterDataArray) {
        const matchingItem = masterDataArray.find(item => item.label === keyName);
        return matchingItem ? matchingItem.value : keyName;
    }
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag, fileName, messageLabel, } = this.props;
    const { faildRecords, failedData, setDisable } = this.state;

    if (faildRecords) {
      return <DownloadUploadBOMxls
        isFailedFlag={true}
        fileName={fileName}
        failedData={failedData}
      />
    }

    return (
      <Drawer anchor={this.props.anchor} open={this.props.isOpen}
      // onClose={(e) => this.toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper WIDTH-400'}>
            <form
              noValidate
              className="form"
              onSubmit={handleSubmit(this.onSubmit.bind(this))}
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`${messageLabel} Upload `}</h3>
                  </div>
                  <div
                    onClick={(e) => this.toggleDrawer('', true)}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>

              <Row className="ml-0">
                <div className="input-group mt25 col-md-12 input-withouticon download-btn" >
                  <DownloadUploadBOMxls
                    fileName={fileName}
                    isFailedFlag={false}
                  />
                </div>

                <div className="input-group mt25 col-md-12 input-withouticon " >
                  <div className="file-uploadsection">
                    {this.state.bomUploadLoader && <LoaderCustom customClass="attachment-loader" />}
                    <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={cloudImg} ></img> </label>
                    <input
                      type="file"
                      name="File"
                      onChange={this.fileHandler}
                      //accept="xls/*"
                      className="" placeholder="bbb" />
                    <p> {this.state.uploadfileName}</p>
                  </div>
                </div>

              </Row>
              <Row className=" justify-content-between ml-0">
                <div className="col-sm-12  bluefooter-butn1 text-right">
                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={this.cancelHandler}
                    disabled={setDisable}>
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="submit-button save-btn"
                    disabled={setDisable}>
                    <div className={"save-icon"}></div>
                    {isEditFlag ? 'Update' : 'Save'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
      </Drawer>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps() {

  return {};
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  BOMUploadPart,
})(reduxForm({
  form: 'BOMUpload',
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation('MasterLabels')(BOMUploadDrawer)));

