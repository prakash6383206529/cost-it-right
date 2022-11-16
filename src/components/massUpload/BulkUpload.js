import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Container, Row, Col, Label } from 'reactstrap';
import { checkForNull, getJsDateFromExcel } from "../../helper/validation";
import {
    bulkUploadRMDomesticZBC, bulkUploadRMDomesticVBC, bulkUploadRMImportCBC, bulkUploadRMDomesticCBC, bulkUploadRMImportZBC, bulkUploadRMImportVBC,
    bulkfileUploadRM, bulkUploadRMSpecification,
} from '../masters/actions/Material';
import { bulkUploadMachineZBC, bulkUploadMachineVBC, bulkUploadMachineMoreZBC, bulkUploadMachineCBC } from '../masters/actions/MachineMaster';
import { fuelBulkUpload } from '../masters/actions/Fuel';
import { labourBulkUpload } from '../masters/actions/Labour';
import { vendorBulkUpload } from '../masters/actions/Supplier';
import { overheadBulkUpload, profitBulkUpload } from '../masters/actions/OverheadProfit';
import { operationZBCBulkUpload, operationVBCBulkUpload, operationCBCBulkUpload } from '../masters/actions/OtherOperation';
import { partComponentBulkUpload, productComponentBulkUpload } from '../masters/actions/Part';
import { bulkUploadBOPDomesticZBC, bulkUploadBOPDomesticCBC, bulkUploadBOPDomesticVBC, bulkUploadBOPImportZBC, bulkUploadBOPImportCBC, bulkUploadBOPImportVBC, } from '../masters/actions/BoughtOutParts';
import { bulkUploadVolumeActualZBC, bulkUploadVolumeActualVBC, bulkUploadVolumeBudgetedZBC, bulkUploadVolumeBudgetedCBC, bulkUploadVolumeActualCBC, bulkUploadVolumeBudgetedVBC, } from '../masters/actions/Volume';
import { bulkUploadInterestRateZBC, bulkUploadInterestRateVBC, bulkUploadInterestRateCBC } from '../masters/actions/InterestRateMaster';
import Toaster from '../common/Toaster';
import { loggedInUserId } from "../../helper/auth";
import { ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import Downloadxls, { checkLabourRateConfigure, checkRM_Process_OperationConfigurable, checkVendorPlantConfig } from './Downloadxls';
import DayTime from '../common/DayTimeWrapper'
import cloudImg from '../../assests/images/uploadcloud.png';
import { ACTUALVOLUMEBULKUPLOAD, BOPDOMESTICBULKUPLOAD, BOPIMPORTBULKUPLOAD, BUDGETEDVOLUMEBULKUPLOAD, CBCTypeId, FUELBULKUPLOAD, INTERESTRATEBULKUPLOAD, LABOURBULKUPLOAD, MACHINEBULKUPLOAD, OPERAIONBULKUPLOAD, PARTCOMPONENTBULKUPLOAD, PRODUCTCOMPONENTBULKUPLOAD, RMDOMESTICBULKUPLOAD, RMIMPORTBULKUPLOAD, RMSPECIFICATION, VBCTypeId, VENDORBULKUPLOAD, ZBCADDMORE, ZBCTypeId } from '../../config/constants';
import { BOP_CBC_DOMESTIC, BOP_CBC_IMPORT, BOP_VBC_DOMESTIC, BOP_VBC_IMPORT, BOP_ZBC_DOMESTIC, BOP_ZBC_IMPORT, CBCInterestRate, CBCOperation, Fuel, Labour, MachineCBC, MachineVBC, MachineZBC, MHRMoreZBC, PartComponent, ProductComponent, RMDomesticCBC, RMDomesticVBC, RMDomesticZBC, RMImportCBC, RMImportVBC, RMImportZBC, RMSpecification, VBCInterestRate, VBCOperation, Vendor, VOLUME_ACTUAL_CBC, VOLUME_ACTUAL_VBC, VOLUME_ACTUAL_ZBC, VOLUME_BUDGETED_CBC, VOLUME_BUDGETED_VBC, VOLUME_BUDGETED_ZBC, ZBCOperation } from '../../config/masterData';
import { checkForSameFileUpload } from '../../helper';
import LoaderCustom from '../common/LoaderCustom';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';

class BulkUpload extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef()
        this.fileUploadRef = React.createRef();
        this.state = {
            cols: [],
            rows: [],
            fileData: [],

            faildRecords: false,
            failedData: [],
            uploadfileName: "",
            setDisable: false,
            bulkUploadLoader: false,
            costingTypeId: props?.fileName === "InterestRate" ? VBCTypeId : ZBCTypeId,
            showPopup: false
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {

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
        this.setState({
            unitTypes: [],
        })
        this.toggleDrawer('')
    }
    cancelHandler = () => {
        this.setState({ showPopup: true })
    }
    onPopupConfirm = () => {
        this.cancel('cancel')
        this.setState({ showPopup: false })
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }
    /**
    * @method onPressHeads
    * @description Used for Costing head check
    */
    onPressHeads = (costingHeadFlag) => {
        setTimeout(() => {
            this.setState({ costingTypeId: costingHeadFlag, fileData: [], uploadfileName: "" });
        }, 300);
    }

    /**
     * @method fileChangedHandler
     * @description called for profile pic change
     */
    fileHandler = event => {
        this.setState({ bulkUploadLoader: true })
        let fileObj = event.target.files[0];
        let fileHeads = [];
        let uploadfileName = fileObj?.name;
        let fileType = uploadfileName?.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            Toaster.warning('File type should be .xls or .xlsx')
            this.setState({ bulkUploadLoader: false })
        } else {
            let data = new FormData()
            data.append('file', fileObj)

            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {

                } else {
                    fileHeads = resp.rows[0];
                    let checkForFileHead
                    switch (String(this.props.fileName)) {
                        case String(RMDOMESTICBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkRM_Process_OperationConfigurable(RMDomesticZBC, ZBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(RMDomesticVBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(RMDomesticCBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(RMIMPORTBULKUPLOAD):

                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkRM_Process_OperationConfigurable(RMImportZBC), fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(RMImportVBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(RMImportCBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(RMSPECIFICATION):
                            checkForFileHead = checkForSameFileUpload(RMSpecification, fileHeads)
                            break;
                        case String(BOPDOMESTICBULKUPLOAD):
                            if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(BOP_VBC_DOMESTIC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(BOP_ZBC_DOMESTIC, fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(BOP_CBC_DOMESTIC, fileHeads)
                            }
                            break;
                        case String(BOPIMPORTBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(BOP_ZBC_IMPORT, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(BOP_VBC_IMPORT, VBCTypeId), fileHeads)
                            }
                            else {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(BOP_CBC_IMPORT, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(PARTCOMPONENTBULKUPLOAD):
                            checkForFileHead = checkForSameFileUpload(PartComponent, fileHeads)
                            break;
                        case String(PRODUCTCOMPONENTBULKUPLOAD):
                            checkForFileHead = checkForSameFileUpload(ProductComponent, fileHeads)
                            break;
                        case String(MACHINEBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(MachineZBC, ZBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(MachineVBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(MachineCBC, ZBCTypeId), fileHeads)
                            }
                            else {
                                checkForFileHead = checkForSameFileUpload(checkRM_Process_OperationConfigurable(MHRMoreZBC), fileHeads)
                            }
                            break;
                        case String(VENDORBULKUPLOAD):
                            checkForFileHead = checkForSameFileUpload(Vendor, fileHeads)
                            break;
                        case String(LABOURBULKUPLOAD):
                            checkForFileHead = checkForSameFileUpload(Labour, fileHeads)
                            break;
                        case String(OPERAIONBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {

                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(ZBCOperation), fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(VBCOperation), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(CBCOperation), fileHeads)
                            }
                            break;
                        case String(FUELBULKUPLOAD):
                            checkForFileHead = checkForSameFileUpload(Fuel, fileHeads)
                            break;
                        case String(INTERESTRATEBULKUPLOAD):
                            if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(VBCInterestRate, fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(CBCInterestRate), fileHeads)
                            }
                            break;
                        case String(ACTUALVOLUMEBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(VOLUME_ACTUAL_ZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(VOLUME_ACTUAL_VBC, VBCTypeId), fileHeads)
                            }
                            else {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(VOLUME_ACTUAL_CBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(BUDGETEDVOLUMEBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(VOLUME_BUDGETED_ZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(VOLUME_BUDGETED_VBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(VOLUME_BUDGETED_CBC, CBCTypeId), fileHeads)
                            }
                            break;
                        default:
                            break;
                    }
                    this.setState({ bulkUploadLoader: false })
                    if (!checkForFileHead) {
                        Toaster.warning('Please select file of same Master')
                        return false
                    }
                    // fileHeads = ["SerialNumber", "BillNumber"]

                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0 && val?.length > 0) {
                            // BELOW CODE FOR HANDLE EMPTY CELL VALUE
                            const i = val.findIndex(e => e === undefined);
                            if (i !== -1) {
                                val[i] = '';
                            }

                            let obj = {}
                            val.map((el, i) => {
                                if ((fileHeads[i] === 'EffectiveDate' || fileHeads[i] === 'DateOfPurchase') && typeof el === 'string' && el !== '') {
                                    el = (DayTime(Date(el))).format('YYYY-MM-DD 00:00:00')
                                }
                                if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
                                    el = getJsDateFromExcel(el)
                                }
                                if (fileHeads[i] === 'NoOfPcs' && typeof el == 'number') {
                                    el = parseInt(checkForNull(el))
                                }
                                if (fileHeads[i] === 'MachineSpecification') {
                                    fileHeads[i] = 'Description'
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
        if (res?.data?.Data) {
            let Data = res?.data?.Data;
            let DynamicData = res?.data?.DynamicData;

            if (Data?.CountSucceeded > 0) {
                Toaster.success(`${Data.CountSucceeded} ${messageLabel} uploaded successfully.`)
                if (DynamicData && DynamicData?.IsDensityAvailable === false) {
                    this.props.densityAlert()
                }
            }

            if (Data?.CountFailed > 0) {
                Toaster.warning(res.data.Message);
                this.setState({
                    failedData: Data.FaildRecords,
                    faildRecords: true,
                })
            }

        }
        this.toggleDrawer('')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData, costingTypeId } = this.state;
        const { fileName, isFinalApprovar } = this.props;
        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }

        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
        }
        let masterUploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
            IsFinalApprover: isFinalApprovar
        }
        this.setState({ setDisable: true })

        if (fileName === 'RMDomestic' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadRMDomesticZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'RMDomestic' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadRMDomesticVBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'RMDomestic' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadRMDomesticCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'RMImport' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadRMImportZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'RMImport' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadRMImportVBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'RMImport' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadRMImportCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'RMSpecification') {
            this.props.bulkUploadRMSpecification(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Vendor') {
            this.props.vendorBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Operation' && costingTypeId === ZBCTypeId) {
            this.props.operationZBCBulkUpload(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Operation' && costingTypeId === VBCTypeId) {
            this.props.operationVBCBulkUpload(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Operation' && costingTypeId === CBCTypeId) {
            this.props.operationCBCBulkUpload(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Fuel') {
            this.props.fuelBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Overhead') {
            this.props.overheadBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Profit') {
            this.props.profitBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Labour') {
            this.props.labourBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'Machine' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadMachineZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Machine' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadMachineVBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Machine' && costingTypeId === ZBCADDMORE) {
            this.props.bulkUploadMachineMoreZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'Machine' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadMachineCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'PartComponent') {
            this.props.partComponentBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOPDomestic' || fileName === 'InsertDomestic') && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadBOPDomesticZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOPDomestic' || fileName === 'InsertDomestic') && costingTypeId === VBCTypeId) {
            this.props.bulkUploadBOPDomesticVBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'BOPDomestic' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadBOPDomesticCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOPImport' || fileName === 'InsertImport') && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadBOPImportZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOPImport' || fileName === 'InsertImport') && costingTypeId === CBCTypeId) {
            this.props.bulkUploadBOPImportCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'ActualVolume' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadVolumeActualZBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'ActualVolume' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadVolumeActualVBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'ActualVolume' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadVolumeActualCBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'BudgetedVolume' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadVolumeBudgetedZBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'BudgetedVolume' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadVolumeBudgetedVBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'BudgetedVolume' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadVolumeBudgetedCBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'InterestRate' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadInterestRateVBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'InterestRate' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadInterestRateCBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'ProductComponent') {
            this.props.productComponentBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        }

        else {
            this.setState({ setDisable: false })
        }

    }

    /**
     * @method render
     * @description Renders the component
     */
    render() {
        const { handleSubmit, isEditFlag, fileName, messageLabel, isZBCVBCTemplate = '', isMachineMoreTemplate } = this.props;
        const { faildRecords, failedData, costingTypeId, setDisable } = this.state;
        if (faildRecords) {
            return <Downloadxls
                isFailedFlag={true}
                fileName={fileName}
                failedData={failedData}
                costingTypeId={costingTypeId}
            />
        }
        return (
            <>
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
                                            <h3>{isEditFlag ? '' : `${messageLabel} Bulk Upload `}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="pl-3">
                                    {isZBCVBCTemplate &&
                                        <Col md="12">
                                            {fileName !== 'InterestRate' &&
                                                <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={
                                                            costingTypeId === ZBCTypeId ? true : false
                                                        }
                                                        onClick={() => this.onPressHeads(ZBCTypeId)}
                                                    />{' '}
                                                    <span>Zero Based</span>
                                                </Label>
                                            }
                                            <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingTypeId === VBCTypeId ? true : fileName === 'InterestRate' ? true : false}
                                                    onClick={() => this.onPressHeads(VBCTypeId)}
                                                />{' '}
                                                <span>Vendor Based</span>
                                            </Label>
                                            <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingTypeId === CBCTypeId ? true : false}
                                                    onClick={() => this.onPressHeads(CBCTypeId)}
                                                />{' '}
                                                <span>Customer Based</span>
                                            </Label>
                                            {isMachineMoreTemplate &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === ZBCADDMORE ? true : false}
                                                        onClick={() => this.onPressHeads(ZBCADDMORE)}
                                                    />{' '}
                                                    <span>ZBC More Details</span>
                                                </Label>}
                                        </Col>}

                                    <div className="input-group mt25 col-md-12 input-withouticon download-btn" >
                                        <Downloadxls
                                            isZBCVBCTemplate={isZBCVBCTemplate}
                                            isMachineMoreTemplate={isMachineMoreTemplate}
                                            fileName={fileName}
                                            isFailedFlag={false}
                                            costingTypeId={costingTypeId}
                                        />
                                    </div>

                                    <div className="input-group mt25 col-md-12 input-withouticon " >
                                        <div className="file-uploadsection">
                                            {this.state.bulkUploadLoader && <LoaderCustom customClass="attachment-loader" />}
                                            <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={cloudImg} ></img> </label>
                                            <input
                                                ref={this.fileUploadRef}
                                                type="file"
                                                name="File"
                                                onChange={this.fileHandler}
                                                onClick={(event) => { event.target.value = [] }}
                                                //accept="xls/*"
                                                className="" placeholder="bbb" />
                                            <p> {this.state.uploadfileName}</p>
                                        </div>
                                    </div>

                                </Row>
                                <Row className=" justify-content-between">
                                    <div className="col-sm-12  text-right">
                                        <button
                                            type={'button'}
                                            className="reset mr15 cancel-btn"
                                            onClick={this.cancelHandler}
                                            disabled={setDisable}
                                        >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="submit"
                                            className="submit-button save-btn"
                                            disabled={setDisable}
                                        >
                                            <div className={"save-icon"}></div>
                                            {isEditFlag ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                }
            </>
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
    bulkfileUploadRM,
    bulkUploadRMSpecification,
    fuelBulkUpload,
    vendorBulkUpload,
    bulkUploadRMDomesticZBC,
    bulkUploadRMDomesticVBC,
    bulkUploadRMImportZBC,
    bulkUploadRMImportVBC,
    overheadBulkUpload,
    profitBulkUpload,
    operationZBCBulkUpload,
    operationVBCBulkUpload,
    labourBulkUpload,
    bulkUploadMachineZBC,
    bulkUploadMachineVBC,
    bulkUploadMachineMoreZBC,
    partComponentBulkUpload,
    productComponentBulkUpload,
    bulkUploadBOPDomesticZBC,
    bulkUploadBOPDomesticVBC,
    bulkUploadBOPImportZBC,
    bulkUploadBOPImportVBC,
    bulkUploadVolumeActualZBC,
    bulkUploadVolumeActualVBC,
    bulkUploadVolumeBudgetedZBC,
    bulkUploadVolumeBudgetedVBC,
    bulkUploadInterestRateZBC,
    bulkUploadInterestRateVBC,
    bulkUploadInterestRateCBC,
    bulkUploadRMDomesticCBC,
    bulkUploadRMImportCBC,
    operationCBCBulkUpload,
    bulkUploadMachineCBC,
    bulkUploadBOPDomesticCBC,
    bulkUploadBOPImportCBC,
    bulkUploadVolumeActualCBC,
    bulkUploadVolumeBudgetedCBC

})(reduxForm({
    form: 'BulkUpload',
    enableReinitialize: true,
    touchOnChange: true
})(BulkUpload));
