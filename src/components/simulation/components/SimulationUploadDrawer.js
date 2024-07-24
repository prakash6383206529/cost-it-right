import React, { Component } from 'react';
import { connect } from 'react-redux';
// import ReactExport from 'react-export-excel';
import { reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import { bulkUploadCosting } from '../../costing/actions/CostWorking'
// import { ExcelRenderer } from 'react-excel-renderer';
import { getJsDateFromExcel } from "../../../helper/validation";
import imgCloud from '../../../assests/images/uploadcloud.png';
import _ from 'lodash'

import { COMBINED_PROCESS, BOPDOMESTIC, BOPIMPORT, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants';
import { BoughtOutPartDomesticFileHeads, BoughtOutPartImportFileHeads, CombinedProcessFileHeads, MachineRateFileHeads, OperationFileHeads, RawMaterialDomesticFileHeads, RawMaterialImportFileHeads } from '../../../config/masterData';
import TooltipCustom from '../../common/Tooltip';
import LoaderCustom from '../../common/LoaderCustom';

// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class SimulationUploadDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            fileData: '',
            fileName: '',
            correctRowCount: '',
            NoOfRowsWithoutChange: '',
            bulkUploadLoader: false
        }
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
            Toaster.warning('Allowed only xlsx files.')
        }
    }

    toggleDrawer = (event, isSaveButtonClicked) => {

        const { fileData, correctRowCount, NoOfRowsWithoutChange } = this.state
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', fileData, correctRowCount, NoOfRowsWithoutChange, isSaveButtonClicked)
    };

    cancel = () => {

        this.toggleDrawer('', true)
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

        // return (<ExcelSheet data={TempData} name={fileName}>
        //     {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        // </ExcelSheet>);
    }

    fileHandler = event => {
        this.setState({ bulkUploadLoader: true })
        let fileObj = event.target.files[0];
        let fileHeads = [];
        let uploadfileName = fileObj?.name;
        let fileType = uploadfileName?.substr(uploadfileName.indexOf('.'));
        let checkForRM = []
        let checkForBopOperMachine = []

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            Toaster.warning('File type should be .xls or .xlsx')
        } else {

            this.setState({ bulkUploadLoader: false })
            let data = new FormData()
            data.append('file', fileObj)
            //will upgrade
            // ExcelRenderer(fileObj, (err, resp) => {
            //     if (err) {

            //     } else {
            //         fileHeads = resp.rows[0];
            //         let checkForRM = fileHeads.slice(0, 7)
            //         let checkForBopOperMachine = fileHeads.slice(0, 4)
            //         let checkForCc = fileHeads.slice(0, 5)
            //         let checkForFileHead
            //         switch (String(this.props.master.value)) {

            //             case String(RMDOMESTIC):
            //                 checkForFileHead = _.isEqual(checkForRM, RawMaterialDomesticFileHeads) ? true : false
            //                 break;

            //             case String(RMIMPORT):
            //                 checkForFileHead = _.isEqual(checkForRM, RawMaterialImportFileHeads) ? true : false
            //                 break;

            //             case String(BOPDOMESTIC):
            //                 checkForFileHead = _.isEqual(checkForBopOperMachine, BoughtOutPartDomesticFileHeads) ? true : false
            //                 break;

            //             case String(BOPIMPORT):
            //                 checkForFileHead = _.isEqual(checkForBopOperMachine, BoughtOutPartImportFileHeads) ? true : false
            //                 break;

            //             case String(OPERATIONS):
            //             case String(SURFACETREATMENT):
            //                 checkForFileHead = _.isEqual(checkForBopOperMachine, OperationFileHeads) ? true : false
            //                 break;

            //             case String(MACHINERATE):
            //                 checkForFileHead = _.isEqual(checkForBopOperMachine, MachineRateFileHeads) ? true : false
            //                 break;

            //             // case String(COMBINED_PROCESS):                 //RE
            //             //     checkForFileHead = _.isEqual(checkForCc, CombinedProcessFileHeads) ? true : false
            //             //     break;

            //             default:
            //                 break;
            //         }
            //         if (!checkForFileHead) {
            //             Toaster.warning('Please select file of same Master')
            //             return false
            //         }
            //         let fileData = [];
            //         let basicRateCount = 0
            //         let correctRowCount = 0
            //         let scrapRateLessBasicRate = 0
            //         let NoOfRowsWithoutChange = 0
            //         let header_row = resp.rows[0];
            //         let br_index = header_row.indexOf("BasicRate");
            //         let rbr_index = header_row.indexOf("RevisedBasicRate");
            //         switch (Number(this.props.master.value)) {
            //             case Number(RMDOMESTIC):
            //             case Number(RMIMPORT):
            //                 const sr_index = header_row.indexOf("ScrapRate");
            //                 const rsr_index = header_row.indexOf("RevisedScrapRate");
            //                 resp.rows.map((val, index) => {
            //                     const scrapTemp = (val[rsr_index] !== val[sr_index]) && val[rsr_index] ? val[rsr_index] : val[sr_index]
            //                     const basicTemp = (val[rbr_index] !== val[br_index]) && val[rbr_index] ? val[rbr_index] : val[br_index]
            //                     if (val.length !== 0) {
            //                         if (index > 0) {
            //                             if ((val[rbr_index] !== '' && val[rbr_index] !== undefined && val[rbr_index] !== null && val[br_index] !== val[rbr_index])) {
            //                                 basicRateCount = 1
            //                             }
            //                             if ((val[rbr_index] === '' || val[rbr_index] === undefined || val[rbr_index] === null || val[br_index] === val[rbr_index])) {
            //                                 NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
            //                                 return false
            //                             }
            //                             if (basicTemp < scrapTemp) {
            //                                 scrapRateLessBasicRate = 1
            //                             }
            //                             correctRowCount = correctRowCount + 1
            //                             let obj = {}

            //                             val.map((el, i) => {

            //                                 if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
            //                                     el = getJsDateFromExcel(el)
            //                                 }
            //                                 if (fileHeads[i] === 'RevisedScrapRate') {
            //                                     obj["NewScrapRate"] = el;
            //                                 } else if (fileHeads[i] === "Grade") {
            //                                     obj["RawMaterialGradeName"] = el;
            //                                 } else if (fileHeads[i] === "Spec") {
            //                                     obj["RawMaterialSpecificationName"] = el;
            //                                 } else if (fileHeads[i] === "Code") {
            //                                     obj["RawMaterialCode"] = el;
            //                                 } else if (fileHeads[i] === "RawMaterial") {
            //                                     obj["RawMaterialName"] = el;
            //                                 } else if (fileHeads[i] === "UOM") {
            //                                     obj["UnitOfMeasurementName"] = el;
            //                                 } else if (fileHeads[i] === "Technology") {
            //                                     obj["TechnologyName"] = el;
            //                                 } else if (fileHeads[i] === "BasicRate") {
            //                                     obj["BasicRatePerUOM"] = el;
            //                                 } else if (fileHeads[i] === "RevisedBasicRate") {
            //                                     obj["NewBasicRate"] = el;
            //                                 }
            //                                 else {
            //                                     obj[fileHeads[i]] = el;
            //                                 }
            //                                 return null;
            //                             })
            //                             fileData.push(obj)

            //                             obj = {}

            //                         }
            //                     }
            //                     return null;
            //                 })
            //                 break;

            //             case Number(OPERATIONS):
            //             case Number(SURFACETREATMENT):
            //                 const r_index = header_row.indexOf("Rate") > 0 ? header_row.indexOf("Rate") : header_row.indexOf("WeldingMaterialRate/kg");
            //                 const rr_index = header_row.indexOf("RevisedRate") > 0 ? header_row.indexOf("RevisedRate") : header_row.indexOf("Revised WeldingMaterialRate/kg");
            //                 resp.rows.map((val, index) => {
            //                     if (val.length !== 0) {
            //                         if (index > 0) {
            //                             if (val[rr_index] !== '' && val[rr_index] !== undefined && val[rr_index] !== null && val[r_index] !== val[rr_index]) {
            //                                 basicRateCount = 1
            //                             }
            //                             if (val[rr_index] === '' || val[rr_index] === undefined || val[rr_index] === null || val[r_index] === val[rr_index]) {
            //                                 NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
            //                                 return false
            //                             }
            //                             correctRowCount = correctRowCount + 1
            //                             let obj = {}
            //                             val.map((el, i) => {
            //                                 if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
            //                                     el = getJsDateFromExcel(el)
            //                                 }
            //                                 if (fileHeads[i] === 'RevisedRate') {
            //                                     obj["NewRate"] = el;
            //                                 } else if (fileHeads[i] === 'OperationType') {
            //                                     obj["ForType"] = el;
            //                                 } else if (fileHeads[i] === 'Consumption') {
            //                                     obj["OperationConsumption"] = el;
            //                                 } else if (fileHeads[i] === 'WeldingMaterialRate/kg') {
            //                                     obj["OperationBasicRate"] = el;
            //                                 } else if (fileHeads[i] === 'Revised WeldingMaterialRate/kg') {
            //                                     obj["NewOperationBasicRate"] = el;
            //                                 } else {
            //                                     obj[fileHeads[i]] = el;
            //                                 }
            //                                 return null;
            //                             })
            //                             fileData.push(obj)
            //                             obj = {}
            //                         }
            //                     }
            //                     return null;
            //                 })
            //                 break;
            //             case Number(MACHINERATE):
            //                 const mr_index = header_row.indexOf("MachineRate");
            //                 const rmr_index = header_row.indexOf("RevisedMachineRate");
            //                 resp.rows.map((val, index) => {
            //                     if (val.length !== 0) {
            //                         if (index > 0) {
            //                             if (val[rmr_index] !== '' && val[rmr_index] !== undefined && val[rmr_index] !== null && val[mr_index] !== val[rmr_index]) {
            //                                 basicRateCount = 1
            //                             }
            //                             if (val[rmr_index] === '' || val[rmr_index] === undefined || val[rmr_index] === null || val[mr_index] === val[rmr_index]) {
            //                                 NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
            //                                 return false
            //                             }
            //                             correctRowCount = correctRowCount + 1
            //                             let obj = {}
            //                             val.map((el, i) => {
            //                                 if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
            //                                     el = getJsDateFromExcel(el);
            //                                 }
            //                                 obj[fileHeads[i] === 'RevisedMachineRate' ? 'NewMachineRate' : fileHeads[i]] = el;
            //                                 return null;
            //                             })
            //                             fileData.push(obj)
            //                             obj = {}

            //                         }
            //                     }
            //                     return null;
            //                 })
            //                 break;
            //             case Number(BOPDOMESTIC):
            //             case Number(BOPIMPORT):
            //                 resp.rows.map((val, index) => {
            //                     if (val.length !== 0) {
            //                         if (index > 0) {
            //                             if (val[rbr_index] !== '' && val[rbr_index] !== undefined && val[rbr_index] !== null && val[br_index] !== val[rbr_index]) {
            //                                 basicRateCount = 1
            //                             }
            //                             if (val[rbr_index] === '' || val[rbr_index] === undefined || val[rbr_index] === null || val[br_index] === val[rbr_index]) {
            //                                 NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
            //                                 return false
            //                             }
            //                             correctRowCount = correctRowCount + 1
            //                             let obj = {}
            //                             val.map((el, i) => {
            //                                 if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
            //                                     el = getJsDateFromExcel(el)
            //                                 }
            //                                 if (fileHeads[i] === 'RevisedBasicRate') {
            //                                     obj["NewBasicRate"] = el;
            //                                 } else if (fileHeads[i] === 'InsertPartNumber') {
            //                                     obj["BoughtOutPartNumber"] = el;
            //                                 } else if (fileHeads[i] === 'InsertPartName') {
            //                                     obj["BoughtOutPartName"] = el;
            //                                 } else if (fileHeads[i] === 'InsertPartCategory') {
            //                                     obj["BoughtOutPartCategory"] = el;
            //                                 } else if (fileHeads[i] === 'InsertPartId') {
            //                                     obj["BoughtOutPartId"] = el;
            //                                 } else {
            //                                     obj[fileHeads[i]] = el;
            //                                 }
            //                                 return null;
            //                             })
            //                             fileData.push(obj)
            //                             obj = {}

            //                         }
            //                     }
            //                     return null;
            //                 })
            //                 break;
            //             case (Number(COMBINED_PROCESS)):                 //RE
            //                 resp.rows.map((val, index) => {
            //                     if (val.length !== 0) {
            //                         if (index > 0) {
            //                             if (val[5] !== '' && val[5] !== undefined && val[4] !== val[5]) {
            //                                 basicRateCount = 1
            //                             }
            //                             if (val[5] === '' || val[5] === undefined || val[4] === val[5]) {
            //                                 NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
            //                                 return false
            //                             }
            //                             correctRowCount = correctRowCount + 1
            //                             let obj = {}
            //                             val.map((el, i) => {
            //                                 if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
            //                                     el = getJsDateFromExcel(el)
            //                                 } if (fileHeads[i] === "RevisedCC") {
            //                                     obj["NewCC"] = el;
            //                                 } else {
            //                                     obj[fileHeads[i]] = el;
            //                                 }
            //                                 obj[fileHeads[i]] = el;
            //                                 return null;
            //                             })
            //                             fileData.push(obj)
            //                             obj = {}

            //                         }
            //                     }
            //                     return null;
            //                 })
            //                 break;
            //             default:
            //                 break;
            //         }


            //         switch (Number(this.props.master.value)) {
            //             case Number(RMDOMESTIC):
            //             case Number(RMIMPORT):
            //                 if (basicRateCount === 0) {
            //                     Toaster.warning('Please change at least one basic rate.')
            //                     return false
            //                 }
            //                 if (scrapRateLessBasicRate === 1) {
            //                     Toaster.warning('Scrap Rate should be less than Basic Rate.')
            //                     return false
            //                 }

            //                 break;
            //             case Number(OPERATIONS):
            //             case Number(SURFACETREATMENT):
            //                 if (basicRateCount === 0) {
            //                     Toaster.warning('Please change at least one rate.')
            //                     return false
            //                 }
            //                 break;
            //             case Number(MACHINERATE):
            //                 if (basicRateCount === 0) {
            //                     Toaster.warning('Please change at least one machine rate.')
            //                     return false
            //                 }
            //                 break;
            //             case Number(BOPDOMESTIC):
            //             case Number(BOPIMPORT):
            //                 if (basicRateCount === 0) {
            //                     Toaster.warning('Please change at least one basic rate.')
            //                     return false
            //                 }
            //                 break;
            //             case Number(COMBINED_PROCESS):                 //RE
            //                 if (basicRateCount === 0) {
            //                     Toaster.warning('Please change at least one Conversion Cost.')
            //                     return false
            //                 }
            //                 break;
            //             default:
            //                 break;
            //         }
            //         // resp.rows.map((val, index) => {
            //         //     if (index > 0) {
            //         //         if (val[10] !== '' && val[10] !== undefined && val[9] !== val[10]) {
            //         //             basicRateCount = 1
            //         //         }
            //         //         if (val[10] === '' && val[14] === '' || val[9] === val[10]) {
            //         //             NoOfRowsWithoutChange = NoOfRowsWithoutChange + 1
            //         //             return false
            //         //         }
            //         //         correctRowCount = correctRowCount + 1
            //         //         let obj = {}
            //         //         val.map((el, i) => {
            //         //             if (fileHeads[i] === 'EffectiveDate' && typeof el == 'number') {
            //         //                 el = getJsDateFromExcel(el)
            //         //             }
            //         //             obj[fileHeads[i]] = el;
            //         //             return null;
            //         //         })
            //         //         fileData.push(obj)
            //         //         obj = {}

            //         //     }
            //         //     return null;
            //         // })
            //         this.setState({
            //             fileData: [...fileData],
            //             uploadfileName: uploadfileName,
            //             correctRowCount: correctRowCount,
            //             NoOfRowsWithoutChange: NoOfRowsWithoutChange
            //         });
            //     }
            // });
        }
    }

    onSubmit = () => {
        const { fileData } = this.state
        // let data = new FormData()
        // data.append('file', fileData)
        if (fileData.length === 0) {
            Toaster.warning("Please select a file to upload.")
            return false
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
                                            onClick={(e) => this.toggleDrawer(e, false)}
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
                                        <TooltipCustom placement="left" customClass="mt-1" tooltipClass="right-tooltip" id="upload-icon" tooltipText={'Please upload the file with data. The file can be downloaded from previous screen.'} />
                                        <div className="input-group mt-1 input-withouticon " >
                                            {this.state.bulkUploadLoader && <LoaderCustom customClass="attachment-loader" />}
                                            <div className="file-uploadsection">
                                                <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={imgCloud} ></img> </label>
                                                <input
                                                    type="file"
                                                    name="File"
                                                    onClick={(event) => { event.target.value = [] }}
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
        touchOnChange: true
    })(SimulationUploadDrawer));

// export default SimulationUploadDrawer;
