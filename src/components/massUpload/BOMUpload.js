import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { getJsDateFromExcel } from "../../helper/validation";
import { BOMUploadPart } from '../masters/actions/Part';
import { toastr } from 'react-redux-toastr';
import { loggedInUserId } from "../../helper/auth";
import { ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import DownloadUploadBOMxls from './DownloadUploadBOMxls';

class BOMUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cols: [],
      rows: [],
      fileData: [],

      faildRecords: false,
      failedData: [],
      uploadfileName: "",
    }
  }

  /**
  * @method toggleModel
  * @description Used to cancel modal
  */
  toggleModel = () => {
    this.props.onCancel();
  }

  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.props.closeDrawer('')
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.toggleDrawer('')
  }

  /**
   * @method fileChangedHandler
   * @description called for profile pic change
   */
  fileHandler = event => {

    let fileObj = event.target.files[0];
    let fileHeads = [];
    let uploadfileName = fileObj.name;
    let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

    //pass the fileObj as parameter
    if (fileType !== '.xls' && fileType !== '.xlsx') {
      toastr.warning('File type should be .xls or .xlsx')
    } else {

      let data = new FormData()
      data.append('file', fileObj)

      ExcelRenderer(fileObj, (err, resp) => {
        if (err) {

        } else {

          fileHeads = resp.rows[0];
          // fileHeads = ["SerialNumber", "BillNumber"]

          let fileData = [];

          resp.rows.map((val, index) => {
            if (index > 0) {

              // BELOW CODE FOR HANDLE EMPTY CELL VALUE
              const i = val.findIndex(e => e === undefined);
              if (i !== -1) {
                val[i] = '';
              }

              let obj = {}
              val.map((el, i) => {
                if (fileHeads[i] === 'EffectiveDate' && typeof el == 'number') {
                  el = getJsDateFromExcel(el)
                }
                obj[fileHeads[i]] = el;
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
    const { messageLabel, } = this.props;
    if (res && res.data.Result === true) {
      toastr.success(`BOM uploaded successfully.`)
    }
    this.toggleDrawer('')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { fileData, } = this.state;
    if (fileData.length === 0) {
      toastr.warning('Please select a file to upload.')
      return false
    }

    let uploadData = {
      Records: fileData,
      IsMultipleUpload: true,
      LoggedInUserId: loggedInUserId(),
    }

    this.props.BOMUploadPart(uploadData, (res) => {
      this.responseHandler(res)
    });


  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag, fileName, messageLabel, } = this.props;
    const { faildRecords, failedData, } = this.state;

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
                    onClick={(e) => this.toggleDrawer(e)}
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
                    <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={require('../../assests/images/uploadcloud.png')} ></img> </label>
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
                    onClick={this.cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="submit-button save-btn" >
                    <div className={"save-icon"}></div>
                    {isEditFlag ? 'Update' : 'Save'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
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
})(BOMUpload));
