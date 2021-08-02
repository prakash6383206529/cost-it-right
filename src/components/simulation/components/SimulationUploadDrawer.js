import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactExport from 'react-export-excel';
import { reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { bulkUploadCosting } from '../../costing/actions/CostWorking'
import { loggedInUserId } from '../../../helper';
import { ExcelRenderer } from 'react-excel-renderer';
import { getJsDateFromExcel } from "../../../helper/validation";
import imgCloud from '../../../assests/images/uploadcloud.png';
import TooltipCustom from '../../common/Tooltip';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class SimulationUploadDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            fileData: '',
            fileName: '',
            correctRowCount: '',
            NoOfRowsWithoutChange: ''
        }
    }

    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post' }
    }
    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {

        const { files } = this.state

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
        const { fileData, correctRowCount, NoOfRowsWithoutChange } = this.state
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', fileData, correctRowCount, NoOfRowsWithoutChange)
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
        } else {

            let data = new FormData()
            data.append('file', fileObj)

            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {

                } else {
                    fileHeads = resp.rows[0];
                    let fileData = [];
                    let basicRateCount = 0
                    let scrapRateCount = 0
                    let correctRowCount = 0
                    let NoOfRowsWithoutChange = 0
                    resp.rows.map((val, index) => {
                        if (index > 0) {
                            if (val[10] !== '' && val[10] !== undefined) {
                                basicRateCount = 1
                            }
                            if (val[10] === '' && val[14] === '') {
                                NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
                                return false
                            }
                            correctRowCount = correctRowCount + 1
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
                    if (basicRateCount === 0) {
                        toastr.warning('Please fill at least one basic rate.')
                        return false
                    }
                    this.setState({
                        fileData: fileData,
                        uploadfileName: uploadfileName,
                        correctRowCount: correctRowCount,
                        NoOfRowsWithoutChange: NoOfRowsWithoutChange
                    });
                }
            });
        }
    }

    onSubmit = () => {
        const { fileData } = this.state
        // let data = new FormData()
        // data.append('file', fileData)

        let obj = {
            file: fileData,
            LoggedInUserId: loggedInUserId(),
        }

        // this.props.bulkUploadCosting(obj, (res) => {
        //     let Data = res.data[0]
        //     const { files } = this.state
        //     files.push(Data)
        // })
        this.cancel()
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
                                                {"Upload Data"}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    {/* <Col md="12">
                                        <ExcelFile fileExtension={'.xls'} filename={"Costing"} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button>}>
                                            {this.returnExcelColumn(CostingBulkUpload, CostingBulkUploadTempData)}
                                        </ExcelFile>
                                    </Col> */}
                                    <Col md="12">
                                        <label className="d-inline-block w-auto">Upload</label>
                                        <div class="tooltip-n ml-1 tooltip-left"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                                            <span class="tooltiptext">Please upload the file with data. The file can be downloaded from previous screen.</span>
                                        </div>
                                        <div className="input-group mt-1 input-withouticon " >
                                            <div className="file-uploadsection">
                                                <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={imgCloud} ></img> </label>
                                                <input
                                                    type="file"
                                                    name="File"
                                                    onChange={this.fileHandler}
                                                    //accept="xls/*"
                                                    className="" placeholder="bbb" />
                                                <p> {this.state.uploadfileName}</p>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12 pl-3 pr-3">
                                        <div className="text-right ">
                                            <button type="submit" className="btn-primary save-btn">
                                                <div className={"save-icon"}></div>
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

}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        bulkUploadCosting
    })(reduxForm({
        form: 'SimulationUploadDrawer',
        enableReinitialize: true,
    })(SimulationUploadDrawer));

// export default SimulationUploadDrawer;