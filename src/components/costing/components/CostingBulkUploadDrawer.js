import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactExport from 'react-export-excel';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import Dropzone from 'react-dropzone-uploader'
import { bulkUploadCosting, plasticBulkUploadCosting } from '../actions/CostWorking'
import { CostingBulkUpload, CostingBulkUploadTempData, PLASTIC } from '../../../config/masterData'
import { fileUploadRMDomestic, } from '../../masters/actions/Material'
import { FILE_URL, SHEET_METAL } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';
import { ExcelRenderer } from 'react-excel-renderer';
import { getJsDateFromExcel } from "../../../helper/validation";
import { getCostingTechnologySelectList, } from '../actions/Costing'
import { searchableSelect } from '../../layout/FormInputs';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class CostingBulkUploadDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            fileData: '',
            fileName: '',
            Technology: []
        }
    }


    /**
 * @method componentWillMount
 * @description Called before render the component
 */
    UNSAFE_componentWillMount() {
        this.props.getCostingTechnologySelectList(() => { })

    }


    renderListing = (label) => {
        const { technologySelectList } = this.props
        let tempArr = []
        if (label === 'Technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                tempArr.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempArr
        }
    }

    handleTechnologyChange = (value) => {
        this.setState({ Technology: value })
    }

    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post' }
    }
    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {

        const { files } = this.state
        let fileObj = files[0];
        let fileHeads = [];

        let data = new FormData()
        data.append('file', fileObj)

        // ExcelRenderer(fileObj, (err, resp) => {
        //     if (err) {

        //     } else {

        //         fileHeads = resp.rows[0];

        //         const check = fileHeads.includes(CostingBulkUpload)

        //         if (check === false) {
        //             toastr.error('Please check your data.')
        //         }
        //         else {
        //             // fileHeads = resp.rows[0];
        //             // let fileData = [];
        //             // resp.rows.map((val, index) => {
        //             //     if (index > 0) {

        //             //         // BELOW CODE FOR HANDLE EMPTY CELL VALUE
        //             //         const i = val.findIndex(e => e === undefined);
        //             //         if (i !== -1) {
        //             //             val[i] = '';
        //             //         }

        //             //         let obj = {}
        //             //         val.map((el, i) => {
        //             //             if (fileHeads[i] === 'EffectiveDate' && typeof el == 'number') {
        //             //                 el = getJsDateFromExcel(el)
        //             //             }
        //             //             if (fileHeads[i] === 'NoOfPcs' && typeof el == 'number') {
        //             //                 el = parseInt(el)
        //             //             }
        //             //             obj[fileHeads[i]] = el;
        //             //             return null;
        //             //         })
        //             //         fileData.push(obj)
        //             //         obj = {}

        //             //     }
        //             //     
        //             //     return null;
        //             // })

        //         };
        //     }
        // });



        if (status === 'removed') {
            const removedFileName = file.name
            let tempArr = files.filter(
                (item) => item.OriginalFileName !== removedFileName,
            )
            this.setState({ files: tempArr })
        }

        if (status === 'done') {

            this.setState({ fileName: file.name, fileData: file })


        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xlsx files.')
        }
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    cancel = () => {
        this.toggleDrawer('')
    }

    Preview = ({ meta }) => {
        return (
            <span
                style={{
                    alignSelf: 'flex-start',
                    margin: '10px 3%',
                    fontFamily: 'Helvetica',
                }}
            >
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    /**
    * @method returnExcelColumn
    * @description Used to get excel column names
    */
    returnExcelColumn = (data = [], TempData) => {
        // const { fileName, failedData, isFailedFlag } = this.props;

        // if (isFailedFlag) {

        //     //BELOW CONDITION TO ADD 'REASON' COLUMN WHILE DOWNLOAD EXCEL SHEET IN CASE OF FAILED
        //     let isContentReason = data.filter(d => d.label === 'Reason')
        //     if (isContentReason.length === 0) {
        //         let addObj = { label: 'Reason', value: 'Reason' }
        //         data.push(addObj)
        //     }
        // }
        const fileName = "Costing"

        return (<ExcelSheet data={TempData} name={fileName}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }
    fileHandler = event => {

        let fileObj = event.target.files[0];
        let fileHeads = [];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            toastr.warning('File type should be .xls or .xlsx')
        }
    }

    onSubmit = (value) => {


        const { fileData } = this.state

        let data = new FormData()
        data.append('file', fileData)

        if (this.state.Technology.label == SHEET_METAL) {

            this.props.bulkUploadCosting(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state
                files.push(Data)
            })
            this.cancel()
        } if (this.state.Technology.label == 'Plastic') {

            this.props.plasticBulkUploadCosting(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state
                files.push(Data)
            })
            this.cancel()
        }

    }
    render() {
        const { handleSubmit } = this.props

        return (
            <>
                <Drawer
                    anchor={this.props.anchor}
                    open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper"}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {"Costing Bulk Upload"}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>
                                <Row className="pl-12">
                                    {/* <Col md="12">
                                        <ExcelFile fileExtension={'.xls'} filename={"Costing"} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button>}>
                                            {this.returnExcelColumn(CostingBulkUpload, CostingBulkUploadTempData)}
                                        </ExcelFile>
                                    </Col> */}
                                    {/* <Col md="12">
                                        <div className="input-group mt25 col-md-12 input-withouticon " >
                                            <div className="file-uploadsection">
                                                <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={require('../../../assests/images/uploadcloud.png')} ></img> </label>
                                                <input
                                                    type="file"
                                                    name="File"
                                                    onChange={this.fileHandler}
                                                    //accept="xls/*"
                                                    className="" placeholder="bbb" />
                                                <p> {this.state.uploadfileName}</p>
                                            </div>
                                        </div>

                                    </Col> */}

                                    <Col md="12">

                                        <Field
                                            name="Technology"
                                            type="text"
                                            label="Technology"
                                            component={searchableSelect}
                                            placeholder={"Select"}
                                            options={this.renderListing("Technology")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //  validate={this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                                            //  required={true}
                                            handleChangeDescription={this.handleTechnologyChange}
                                            valueDescription={this.state.Technology}
                                        // disabled={isEditFlag ? true : false}
                                        />
                                    </Col>

                                    <Col md="12">
                                        <label>Upload File</label>
                                        {this.state.fileName !== "" ? (
                                            <div class="alert alert-danger" role="alert">
                                                {this.state.fileName}
                                            </div>
                                        ) : (
                                            <Dropzone
                                                getUploadParams={this.getUploadParams}
                                                onChangeStatus={this.handleChangeStatus}
                                                PreviewComponent={this.Preview}
                                                onChange={this.fileHandler}
                                                accept=".xlsx"
                                                initialFiles={this.state.initialFiles}
                                                maxFiles={1}
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
                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12 pl-3 pr-3">
                                        <div className="text-right ">
                                            <button
                                                onClick={this.cancel}
                                                type="submit"
                                                value="CANCEL"
                                                className="reset mr15 cancel-btn"
                                            >
                                                <div className={"cross-icon"}>
                                                    <img
                                                        src={require("../../../assests/images/times.png")}
                                                        alt="cancel-icon.jpg"
                                                    />
                                                </div>
                                                    CANCEL
                                            </button>
                                            <button type="submit" className="btn-primary save-btn">
                                                <div className={"check-icon"}>
                                                    <img src={require("../../../assests/images/check.png")} alt="" />
                                                </div>
                                                {"SAVE"}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { costing } = state
    const { technologySelectList } = costing
    return { technologySelectList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        bulkUploadCosting,
        getCostingTechnologySelectList,
        plasticBulkUploadCosting
    })(reduxForm({
        form: 'CostingBulkUploadDrawer',
        enableReinitialize: true,
    })(CostingBulkUploadDrawer));

// export default CostingBulkUploadDrawer;