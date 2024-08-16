import React, { useState, useRef, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import Dropzone from 'react-dropzone-uploader';
import { useDispatch } from 'react-redux';
import { maxLength512, acceptAllExceptSingleSpecialCharacter, checkForNull, getConfigurationKey } from '../../helper';
import Toaster from '../common/Toaster';
import { SetRawMaterialDetails, fileUploadRMDomestic } from './actions/Material';
import imgRedcross from '../../assests/images/red-cross.png';
import LoaderCustom from '../common/LoaderCustom';
import { FILE_URL } from '../../config/constants';
import { TextAreaHookForm } from '../layout/HookFormInputs';
import HeaderTitle from '../common/HeaderTitle';

// Helper component for attachment previews
const Preview = ({ meta }) => (
    <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
    </span>
);

function RemarksAndAttachments(props) {
    const { Controller, control, register, setValue, getValues, errors, useWatch, states, data } = props
    const { isEditFlag, isViewFlag } = data
    const [state, setState] = useState({
        remarks: '',
        attachmentLoader: false,
        isOpen: false,
        isAttachmentOpen: false,
    });
    const [files, setFiles] = useState([]);
    const dropzone = useRef(null);
    const dispatch = useDispatch();
    const nonFinancialFieldValues = useWatch({
        control,
        name: ['Remarks']
    })
    useEffect(() => {
        handleNonFinancialData()
    }, [nonFinancialFieldValues, files])
    useEffect(() => {
        dispatch(SetRawMaterialDetails({ Files: files }, () => { }))
    }, [files])

    useEffect(() => {
        if (isEditFlag && props?.DataToChange && Object.keys(props?.DataToChange).length > 0) {
            let Data = props?.DataToChange
            const filesList = (Data?.FileList || []).map((item) => {
                // Create a shallow copy of the item and add metadata
                const newItem = { ...item, meta: { id: item.FileId, status: 'done' } };
                return newItem;
            });
            setState(prevState => ({
                ...prevState,
                remarks: Data.Remark,
            }))
            setFiles(filesList)
            setValue('Remarks', Data.Remark)
            let files = filesList && filesList.map((item) => {
                item.meta = {}
                item.meta.id = item.FileId
                item.meta.status = 'done'
                return item
            })
            if (dropzone.current !== null) {
                dropzone.current.files = files
            }
        }
    }, [props?.DataToChange])


    /**
 * @method handleMessageChange
 * @description used remarks handler
 */
    const handleMessageChange = (e) => {
        setState(prevState => ({
            ...prevState,
            remarks: e?.target?.value,
        }))
    }
    /**
* @method setDisableFalseFunction
* @description setDisableFalseFunction
*/
    const setDisableFalseFunction = () => {
        const loop = Number(dropzone.current.files.length) - Number(files.length)
        if (Number(loop) === 1 || Number(dropzone.current.files.length) === Number(files.length)) {
            setState(prevState => ({
                ...prevState,
                attachmentLoader: false
            }))
        }
    }

    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }, status) => {
        setState(prevState => ({ ...prevState, attachmentLoader: true }))

        if (status === 'removed') {
            const removedFileName = file.name
            let tempArr = files.filter(
                (item) => item.OriginalFileName !== removedFileName,
            )
            setFiles(tempArr)
            setState(prevState => ({ ...prevState, isOpen: !state.isOpen }))
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            dispatch(fileUploadRMDomestic(data, (res) => {
                setDisableFalseFunction()
                if ('response' in res) {
                    status = res && res?.response?.status
                    dropzone.current.files.pop()
                }
                else {
                    let Data = res.data[0]
                    files.push(Data)
                    setState(prevState => ({ ...prevState, attachmentLoader: false }))
                    setFiles(files)
                    setTimeout(() => {
                        setState(prevState => ({ ...prevState, isOpen: !state.isOpen }))
                    }, 500);
                }
            }))
        }

        if (status === 'rejected_file_type') {
            setDisableFalseFunction()
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        } else if (status === 'error_file_size') {
            setDisableFalseFunction()
            dropzone.current.files.pop()
            Toaster.warning("File size greater than 2 mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            setDisableFalseFunction()
            dropzone.current.files.pop()
            Toaster.warning("Something went wrong")
        }
    }

    const deleteFile = (FileId, OriginalFileName) => {
        let file = [...files]
        if (FileId != null) {
            let tempArr = file.filter((item) => item.FileId !== FileId)
            setFiles(tempArr)
        }
        if (FileId == null) {
            let tempArr = file.filter(
                (item) => item.FileName !== OriginalFileName,
            )
            setFiles(tempArr)
        }

        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzone?.current !== null) {
            dropzone.current.files.pop()
        }
    }
    const handleNonFinancialData = () => {
        let remark = getValues('Remarks')
        if (isEditFlag) {
            if (remark === props?.DataToChange?.Remark && JSON.stringify(files) === JSON.stringify(props?.DataToChange?.FileList)) {
                dispatch(SetRawMaterialDetails({ nonFinancialDataChanged: false }, () => { }))
            } else {
                dispatch(SetRawMaterialDetails({ nonFinancialDataChanged: true }, () => { }))
            }

        }
    }

    return (
        <Row className="mb-3 accordian-container">


            {/* <div className="accordian-content row mx-0 w-100"> */}
            <Col md="6">
                <TextAreaHookForm
                    label={`Remarks`}
                    name={"Remarks"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    rowHeight={6}
                    mandatory={false}
                    rules={{
                        validate: { maxLength512, acceptAllExceptSingleSpecialCharacter },
                        maxLength: {
                            value: 500,
                            message: "Remark should be less than 500 words"
                        },
                    }}
                    handleChange={handleMessageChange}
                    defaultValue={""}
                    className=""
                    customClassName={"textAreaWithBorder"}
                    errors={errors.Remarks}
                    disabled={isViewFlag}
                />
            </Col>
            <Col md="3">
                <label>Upload Files <small>(upload up to {getConfigurationKey().MaxMasterFilesToUpload} files, each with a size limit of 2MB)</small></label>
                <div className={`alert alert-danger mt-2 ${files?.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                    Maximum file upload limit reached.
                </div>

                <div id="AddRMDomestic_uploadFiles" className={`${files?.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                    <Dropzone
                        ref={dropzone}
                        onChangeStatus={handleChangeStatus}
                        PreviewComponent={Preview}
                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                        initialFiles={state.initialFiles}
                        maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
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
                        disabled={isViewFlag}
                    />
                </div>
            </Col>
            <Col md="3">
                <div className={"attachment-wrapper"}>
                    {state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                    {files &&
                        files.map((f) => {
                            const withOutTild = f.FileURL.replace(
                                "~",
                                ""
                            );
                            const fileURL = `${FILE_URL}${withOutTild}`;
                            return (
                                <div className={"attachment images"}>
                                    <a href={fileURL} target="_blank" rel="noreferrer" title={f.OriginalFileName}>
                                        {f.OriginalFileName}
                                    </a>
                                    {!isViewFlag && <img
                                        className="float-right"
                                        alt={""}
                                        onClick={() =>
                                            deleteFile(f.FileId, f.FileName)
                                        }
                                        src={imgRedcross}
                                    ></img>}
                                </div>
                            );
                        })}
                </div>
            </Col>

            {/* </div> */}

        </Row>
    );
};

export default RemarksAndAttachments;
