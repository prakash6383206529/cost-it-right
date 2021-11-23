import React,{useState,useContext} from 'react';
import { connect,useDispatch } from 'react-redux';
import { Field, reduxForm,} from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { renderText, renderTextAreaField, searchableSelect } from '../../layout/FormInputs';
import {fileUploadCosting, fileDeleteCosting} from '../actions/Costing';
import { loggedInUserId, } from '../../../helper';
import { FILE_URL } from '../../../config/constants';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import { ViewCostingContext } from './CostingDetails';
import redCross from "../../../assests/images/red-cross.png"
import Toaster from '../../common/Toaster';

export function Clientbasedcostingdrawer(props) {
    const toggleDrawer = () => {
        props.closeDrawer('')
    };

    const [initialFiles, setInitialFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [IsOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch()

    const CostingViewMode = useContext(ViewCostingContext);

    // dropzone start
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
        Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }

    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
        let deleteData = {
            Id: FileId,
            DeletedBy: loggedInUserId(),
        }
        dispatch(fileDeleteCosting(deleteData, (res) => {
            Toaster.success('File has been deleted successfully.')
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
    // dropzone end

    const { handleSubmit } = props;
    return (
        <>
            <Drawer anchor={props.anchor} open={props.isOpen} className="client-based-costing-drawer">
                <Container>
                    <form noValidate className="form" onSubmit={handleSubmit}>
                        <div className={"drawer-wrapper drawer-1500px"}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>{"Add Costing"}</h3>
                                    </div>
                                    <div onClick={(e) => toggleDrawer(e)}className={"close-button right"}></div>
                                </Col>
                            </Row>
                            <Row className="pt-2">
                                <Col md="12">
                                    <span class="d-inline-block mr-4 mb-4 pl-3">
                                        <span class="cr-tbl-label d-block">Costing Head:</span>
                                        <span>CBC</span>
                                    </span>
                                    <span class="d-inline-block mr-4 mb-4 pl-3">
                                        <span class="cr-tbl-label d-block">Client name:</span>
                                        <span>Jessica Miles</span>
                                    </span>
                                    <span class="d-inline-block mr-4 mb-4 pl-3">
                                        <span class="cr-tbl-label d-block">Client Code:</span>
                                        <span>123456</span>
                                    </span>
                                    <span class="d-inline-block mr-4 mb-4 pl-3">
                                        <span class="cr-tbl-label d-block">Costing ID:</span>
                                        <span>CS7654 - 12/01/2020 10:00AM</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row className="px-3">
                                <Col md="12" className="pb-4">
                                    <div className="blue-header-box">
                                        <h5>Net PO Price: Auto Calculated</h5>
                                    </div>
                                </Col>
                                <Col md="12">
                                    <h5 className="left-border">RM Cost</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`RM Name-Grade`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Gross Weight`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Finish Weight`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Net RM Cost`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">BOP Cost</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Net BOP Cost`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">Conversion Cost</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Process Cost`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Operation Cost`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Surface Treatement`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Transportation Cost`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Net Conversion Cost`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">Overhead & Profits</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Model Type For Overhead/Profit`}
                                    type="text"
                                    placeholder={"Select"}
                                    component={searchableSelect}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3" className="two-filled-container">
                                    <label>Overhead</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Applicability"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Enter Value"}
                                            component={renderText}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>

                                <Col md="3" className="two-filled-container">
                                    <label>Profit</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Applicability"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Enter Value"}
                                            component={renderText}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>

                                <Col md="3" className="two-filled-container">
                                    <label>Rejection</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Applicability"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Enter Value"}
                                            component={renderText}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>

                                <Col md="3" className="two-filled-container">
                                    <label>ICC</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Applicability"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Enter Value"}
                                            component={renderText}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>

                                <Col md="3" className="two-filled-container">
                                    <label>Payment Terms</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Applicability"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Enter Value"}
                                            component={renderText}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>

                                <Col md="3">
                                    <Field
                                    label={`Net Overhead & Profits`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">Tool Cost</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Tool Maintenance Cost`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Tool Price`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Amortization Quantity ( Tool Life)`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Total Tool Cost`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">Total Cost</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Total Cost`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3" className="two-filled-container">
                                    <label>Hundi/Other Discount</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Discount %"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Enter Value"}
                                            component={renderText}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="3">
                                    <Field
                                    label={`Any Other Cost`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="9">
                                    <Field
                                    label={`Remark`}
                                    type="text"
                                    placeholder={"Enter"}
                                    component={renderText}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>
                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">Net PO Price</h5>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Net PO Price (INR)`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                                <Col md="3" className="two-filled-container">
                                    <label>Currency</label>
                                    <Row className="p-0">
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Select"}
                                            component={searchableSelect}
                                            className=""
                                            customClassName="withBorder"/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                            label={``}
                                            type="text"
                                            placeholder={"Auto Calculated"}
                                            component={renderText}
                                            disabled={true}
                                            className=""
                                            customClassName="withBorder hide-label-inside"/>
                                        </div>
                                    </Row>
                                </Col>
                                <Col md="3">
                                    <Field
                                    label={`Net PO Price`}
                                    type="text"
                                    placeholder={"Auto Calculated"}
                                    component={renderText}
                                    disabled={true}
                                    className=""
                                    customClassName="withBorder"/>
                                </Col>
                            </Row>

                            <Row className="px-3">
                                <Col md="12">
                                    <h5 className="left-border">Attachment <span class="font-weight-normal">( upload up to 3 files )</span></h5> 
                                </Col>
                                <Col md="6" className="height152-label">
                                    {files && files.length >= 4 ? (
                                        <div class="alert alert-danger" role="alert">
                                        Maximum file upload limit has been reached.
                                        </div>
                                    ) : (
                                        <Dropzone
                                        getUploadParams={getUploadParams}
                                        onChangeStatus={handleChangeStatus}
                                        PreviewComponent={Preview}
                                        //onSubmit={this.handleSubmit}
                                        accept="*"
                                        initialFiles={initialFiles}
                                        maxFiles={4}
                                        maxSizeBytes={2000000000}
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
                                        disabled={CostingViewMode ? true : false}
                                        />
                                    )}
                                </Col>
                                <Col md="6">
                                    <div className={"attachment-wrapper"}>
                                        {files &&
                                        files.map((f) => {
                                            const withOutTild = f.FileURL.replace("~", "");
                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                            return (
                                            <div className={"attachment images"}>
                                                <a href={fileURL} target="_blank" rel="noreferrer">
                                                {f.OriginalFileName}
                                                </a>
                                                <img
                                                alt={""}
                                                className="float-right"
                                                onClick={() => deleteFile(f.FileId, f.FileName)}
                                                src={redCross}
                                                ></img>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </Col>
                            </Row>
                            <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                                <div className="col-sm-12 text-right px-3">
                                    <button onClick={(e) => toggleDrawer(e)} type={"button"} className=" mr15 cancel-btn" > <div className={"cancel-icon"}></div>{"Cancel"} </button>
                                    <button type="submit" className="user-btn save-btn" ><div className={"save-icon"}></div>{"Save"} </button>
                                </div>
                            </Row>
                        </div>
                    </form>
                </Container>
            </Drawer>
        </>
    )
}

export default reduxForm({form:'clientBasedCostingForm'})(Clientbasedcostingdrawer);
