import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { ATTACHMENTS, FILE_URL, IMPACT_SHEET, INVOICE_BACKUP, OTHER, SUPPLIER_CONFRIM } from '../../../../config/constants';
import redcrossImg from '../../../../assests/images/red-cross.png'
import { fileDeleteCosting, fileUploadCosting } from '../../actions/Costing'
import { setAttachmentFileData, uploadSimulationAttachmentByCategory, uploadSimulationAttachmentonFTP } from '../../../simulation/actions/Simulation'
import { toastr } from 'react-redux-toastr';
import { loggedInUserId } from '../../../../helper';


function AttachmentSec(props) {
    const dispatch = useDispatch()
    const { token, type, Attachements } = props
    const [acc1, setAcc1] = useState(false)
    const [acc2, setAcc2] = useState(false)
    const [acc3, setAcc3] = useState(false)
    const [acc4, setAcc4] = useState(false)
    const [acc5, setAcc5] = useState(false)

    const [files, setFiles] = useState([]);
    const [supplierFiles, setSupplierFiles] = useState([]);
    const [invoiceFiles, setInvoiceFiles] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);
    const [attachmentFiles, setAttachmentFiles] = useState([]);

    const [IsOpen, setIsOpen] = useState(false);
    const [initialFiles, setInitialFiles] = useState([]);


    useEffect(() => {
        let obj = [...files, ...supplierFiles, ...invoiceFiles, ...otherFiles, ...attachmentFiles]
        dispatch(setAttachmentFileData(obj, () => { }))
    }, [files, supplierFiles, invoiceFiles, otherFiles, attachmentFiles, IsOpen])


    useEffect(() => {
        Attachements && Attachements.map(item => {
            if (item.AttachementCategory === IMPACT_SHEET) {
                files.push(item)
                setFiles(files)
            } else if (item.AttachementCategory === SUPPLIER_CONFRIM) {
                supplierFiles.push(item)
                setSupplierFiles(supplierFiles)
            } else if (item.AttachementCategory === INVOICE_BACKUP) {
                invoiceFiles.push(item)
                setInvoiceFiles(invoiceFiles)
            } else if (item.AttachementCategory === OTHER) {
                otherFiles.push(item)
                setOtherFiles(otherFiles)
            } else if (item.AttachementCategory === ATTACHMENTS) {
                attachmentFiles.push(item)
                setAttachmentFiles(attachmentFiles)
            }

        })
        setIsOpen(!IsOpen)
    }, [])

    // attacment section 
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
            data.append('Token', token)
            data.append('Folder', IMPACT_SHEET)

            dispatch(uploadSimulationAttachmentByCategory(data, (res) => {
                let Data = res.data[0]
                files.push(Data)
                setFiles(files)
                setIsOpen(!IsOpen)
                let path = `${Data.AttachementCategory}\\\\${Data.FileName}`
                let uploadData = new FormData()
                uploadData.append('path', path)
                dispatch(uploadSimulationAttachmentonFTP(uploadData, (res) => { }))
            }))
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }


    const handleChangeSupplierConfirmationStatus = ({ meta, file }, status) => {

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = supplierFiles && supplierFiles.filter(item => item.OriginalFileName !== removedFileName)
            setSupplierFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            data.append('Token', token)
            data.append('Folder', SUPPLIER_CONFRIM)

            dispatch(uploadSimulationAttachmentByCategory(data, (res) => {
                let Data = res.data[0]
                supplierFiles.push(Data)
                setSupplierFiles(supplierFiles)
                setIsOpen(!IsOpen)
                let path = `${Data.AttachementCategory}\\\\${Data.FileName}`
                let uploadData = new FormData()
                uploadData.append('path', path)
                dispatch(uploadSimulationAttachmentonFTP(uploadData, (res) => { }))
            }))
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }


    const handleChangeInvoiceBackupStatus = ({ meta, file }, status) => {


        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = invoiceFiles && invoiceFiles.filter(item => item.OriginalFileName !== removedFileName)
            setInvoiceFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            data.append('Token', token)
            data.append('Folder', INVOICE_BACKUP)
            dispatch(uploadSimulationAttachmentByCategory(data, (res) => {
                let Data = res.data[0]
                invoiceFiles.push(Data)
                setInvoiceFiles(invoiceFiles)
                setIsOpen(!IsOpen)
            }))
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }
    const handleOtherChangeStatus = ({ meta, file }, status) => {


        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = otherFiles && otherFiles.filter(item => item.OriginalFileName !== removedFileName)
            setOtherFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            data.append('Token', token)
            data.append('Folder', OTHER)
            dispatch(uploadSimulationAttachmentByCategory(data, (res) => {
                let Data = res.data[0]
                otherFiles.push(Data)
                setOtherFiles(otherFiles)
                setIsOpen(!IsOpen)
                let path = `${Data.AttachementCategory}\\\\${Data.FileName}`
                let uploadData = new FormData()
                uploadData.append('path', path)
                dispatch(uploadSimulationAttachmentonFTP(uploadData, (res) => { }))
            }))
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }
    const handleChangeAttachment = ({ meta, file }, status) => {


        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = attachmentFiles && attachmentFiles.filter(item => item.OriginalFileName !== removedFileName)
            setAttachmentFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            data.append('Token', token)
            data.append('Folder', ATTACHMENTS)
            dispatch(uploadSimulationAttachmentByCategory(data, (res) => {
                let Data = res.data[0]
                attachmentFiles.push(Data)
                setAttachmentFiles(attachmentFiles)
                setIsOpen(!IsOpen)
                let path = `${Data.AttachementCategory}\\\\${Data.FileName}`
                let uploadData = new FormData()
                uploadData.append('path', path)
                dispatch(uploadSimulationAttachmentonFTP(uploadData, (res) => { }))
            }))
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
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
    const deleteFileOthers = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            dispatch(fileDeleteCosting(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = otherFiles && otherFiles.filter(item => item.FileId !== FileId)
                setOtherFiles(tempArr)
                setIsOpen(!IsOpen)
            }))
        }
        if (FileId == null) {
            let tempArr = otherFiles && otherFiles.filter(item => item.FileName !== OriginalFileName)
            setOtherFiles(tempArr)
            setIsOpen(!IsOpen)
        }
    }

    const deleteFileSupplierConfirmation = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            dispatch(fileDeleteCosting(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = supplierFiles && supplierFiles.filter(item => item.FileId !== FileId)
                setSupplierFiles(tempArr)
                setIsOpen(!IsOpen)
            }))
        }
        if (FileId == null) {
            let tempArr = supplierFiles && supplierFiles.filter(item => item.FileName !== OriginalFileName)
            setSupplierFiles(tempArr)
            setIsOpen(!IsOpen)
        }
    }

    const deleteFileInvoiceBackups = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            dispatch(fileDeleteCosting(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = invoiceFiles && invoiceFiles.filter(item => item.FileId !== FileId)
                setInvoiceFiles(tempArr)
                setIsOpen(!IsOpen)
            }))
        }
        if (FileId == null) {
            let tempArr = invoiceFiles && invoiceFiles.filter(item => item.FileName !== OriginalFileName)
            setInvoiceFiles(tempArr)
            setIsOpen(!IsOpen)
        }
    }

    const deleteFileAttachments = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            dispatch(fileDeleteCosting(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = attachmentFiles && attachmentFiles.filter(item => item.FileId !== FileId)
                setAttachmentFiles(tempArr)
                setIsOpen(!IsOpen)
            }))
        }
        if (FileId == null) {
            let tempArr = attachmentFiles && attachmentFiles.filter(item => item.FileName !== OriginalFileName)
            setAttachmentFiles(tempArr)
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

    return (
        <>
            {/* FIRST ATTACHMENT SECTION */}
            <div className="col-md-12 drawer-attachment">
                <div className="d-flex w-100 flex-wrap">
                    <Col md="8" className="p-0"><h6 className="mb-0">{IMPACT_SHEET}</h6></Col>
                    <Col md="4" className="text-right p-0">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc1(!acc1) }}>
                            {acc1 ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </Col>
                </div>
                <div className="d-flex w-100 flex-wrap pt-2">
                    {acc1 && <>
                        <Col md="12" className="p-0">
                            <label>Upload Attachment (upload up to 2 files)</label>
                            {files && files.length >= 2 ? (
                                <div class="alert alert-danger" role="alert">
                                    Maximum file upload limit has been reached.
                                </div>
                            ) : (
                                <Dropzone
                                    getUploadParams={getUploadParams}
                                    onChangeStatus={handleChangeStatus}
                                    PreviewComponent={Preview}
                                    // onSubmit={handleImapctSubmit}
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
                                    disabled={type === 'Sender' ? false : true}
                                />
                            )}
                        </Col>
                        <div className="w-100">
                            <div className={"attachment-wrapper mt-0 mb-3"}>
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
                                                    src={redcrossImg}
                                                ></img>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
            {/* 2 ATTACHMENT SECTION STARTS HERE */}
            <div className="col-md-12 drawer-attachment">
                <div className="d-flex w-100 flex-wrap">
                    <Col md="8" className="p-0"><h6 className="mb-0">{SUPPLIER_CONFRIM}</h6></Col>
                    <Col md="4" className="text-right p-0">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc2(!acc2) }}>
                            {acc2 ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </Col>
                </div>
                <div className="d-flex w-100 flex-wrap pt-2">
                    {acc2 && <>
                        <Col md="12" className="p-0">
                            <label>Upload Attachment (upload up to 2 files)</label>
                            {supplierFiles && supplierFiles.length >= 2 ? (
                                <div class="alert alert-danger" role="alert">
                                    Maximum file upload limit has been reached.
                                </div>
                            ) : (
                                <Dropzone
                                    getUploadParams={getUploadParams}
                                    onChangeStatus={handleChangeSupplierConfirmationStatus}
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
                                    className="draper-drop"
                                    disabled={type === 'Sender' ? false : true}
                                />
                            )}
                        </Col>
                        <div className="w-100">
                            <div className={"attachment-wrapper mt-0 mb-3"}>
                                {supplierFiles &&
                                    supplierFiles.map((f) => {
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
                                                    onClick={() => deleteFileSupplierConfirmation(f.FileId, f.FileName)}
                                                    src={redcrossImg}
                                                ></img>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>

            {/* 3 ATTACHMNET STARTS HERE */}
            <div className="col-md-12 drawer-attachment">
                <div className="d-flex w-100 flex-wrap">
                    <Col md="8" className="p-0"><h6 className="mb-0">{INVOICE_BACKUP}</h6></Col>
                    <Col md="4" className="text-right p-0">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc3(!acc3) }}>
                            {acc3 ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </Col>
                </div>
                <div className="d-flex w-100 flex-wrap pt-2">
                    {acc3 && <>
                        <Col md="12" className="p-0">
                            <label>Upload Attachment (upload up to 10 files)</label>
                            {invoiceFiles && invoiceFiles.length >= 10 ? (
                                <div class="alert alert-danger" role="alert">
                                    Maximum file upload limit has been reached.
                                </div>
                            ) : (
                                <Dropzone
                                    getUploadParams={getUploadParams}
                                    onChangeStatus={handleChangeInvoiceBackupStatus}
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
                                    className="draper-drop"
                                    disabled={type === 'Sender' ? false : true}
                                />
                            )}
                        </Col>
                        <div className="w-100">
                            <div className={"attachment-wrapper mt-0 mb-3"}>
                                {invoiceFiles &&
                                    invoiceFiles.map((f) => {
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
                                                    onClick={() => deleteFileInvoiceBackups(f.FileId, f.FileName)}
                                                    src={redcrossImg}
                                                ></img>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
            {/* 4 ATTACHMWENT STARTS HERE */}
            <div className="col-md-12 drawer-attachment">
                <div className="d-flex w-100 flex-wrap">
                    <Col md="8" className="p-0"><h6 className="mb-0">Others</h6></Col>
                    <Col md="4" className="text-right p-0">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc4(!acc4) }}>
                            {acc4 ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </Col>
                </div>
                <div className="d-flex w-100 flex-wrap pt-2">
                    {acc4 && <>
                        <Col md="12" className="p-0">
                            <label>Upload Attachment (upload up to 10 files)</label>
                            {otherFiles && otherFiles.length >= 10 ? (
                                <div class="alert alert-danger" role="alert">
                                    Maximum file upload limit has been reached.
                                </div>
                            ) : (
                                <Dropzone
                                    getUploadParams={getUploadParams}
                                    onChangeStatus={handleOtherChangeStatus}
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
                                    className="draper-drop"
                                    disabled={type === 'Sender' ? false : true}
                                />
                            )}
                        </Col>
                        <div className="w-100">
                            <div className={"attachment-wrapper mt-0 mb-3"}>
                                {otherFiles &&
                                    otherFiles.map((f) => {
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
                                                    onClick={() => deleteFileOthers(f.FileId, f.FileName)}
                                                    src={redcrossImg}
                                                ></img>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
            {/* 5 ATTACHMENT STARTS HERE */}
            <div className="col-md-12 drawer-attachment">
                <div className="d-flex w-100 flex-wrap">
                    <Col md="8" className="p-0"><h6 className="mb-0">Attachments</h6></Col>
                    <Col md="4" className="text-right p-0">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc5(!acc5) }}>
                            {acc5 ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </Col>
                </div>
                <div className="d-flex w-100 flex-wrap pt-2">
                    {acc5 && <>
                        <Col md="12" className="p-0">
                            <label>Upload Attachment (upload up to 4 files)</label>
                            {attachmentFiles && attachmentFiles.length >= 4 ? (
                                <div class="alert alert-danger" role="alert">
                                    Maximum file upload limit has been reached.
                                </div>
                            ) : (
                                <Dropzone
                                    getUploadParams={getUploadParams}
                                    onChangeStatus={handleChangeAttachment}
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
                                    className="draper-drop"
                                    disabled={type === 'Sender' ? false : true}
                                />
                            )}
                        </Col>
                        <div className="w-100">
                            <div className={"attachment-wrapper mt-0 mb-3"}>
                                {attachmentFiles &&
                                    attachmentFiles.map((f) => {
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
                                                    onClick={() => deleteFileAttachments(f.FileId, f.FileName)}
                                                    src={redcrossImg}
                                                ></img>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
        </>

    );
}

export default React.memo(AttachmentSec);