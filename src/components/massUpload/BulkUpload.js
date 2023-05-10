import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Container, Row, Col, Label } from 'reactstrap';
import { checkForNull, getJsDateFromExcel, isDateFormatter } from "../../helper/validation";
import {
    bulkUploadRM, bulkfileUploadRM, bulkUploadRMSpecification,
} from '../masters/actions/Material';
import { bulkUploadMachine, bulkUploadMachineMoreZBC } from '../masters/actions/MachineMaster';
import { fuelBulkUpload } from '../masters/actions/Fuel';
import { labourBulkUpload } from '../masters/actions/Labour';
import { vendorBulkUpload } from '../masters/actions/Supplier';
import { overheadBulkUpload, profitBulkUpload } from '../masters/actions/OverheadProfit';
import { operationBulkUpload } from '../masters/actions/OtherOperation';
import { partComponentBulkUpload, productComponentBulkUpload } from '../masters/actions/Part';
import { bulkUploadBOP } from '../masters/actions/BoughtOutParts';
import { bulkUploadVolumeActualZBC, bulkUploadVolumeActualVBC, bulkUploadVolumeBudgetedZBC, bulkUploadVolumeBudgetedCBC, bulkUploadVolumeActualCBC, bulkUploadVolumeBudgetedVBC, } from '../masters/actions/Volume';
import { bulkUploadBudgetMaster } from '../masters/actions/Budget'
import { bulkUploadInterestRateZBC, bulkUploadInterestRateVBC, bulkUploadInterestRateCBC } from '../masters/actions/InterestRateMaster';
import Toaster from '../common/Toaster';
import { loggedInUserId, userDetails } from "../../helper/auth";
import { ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import Downloadxls, { checkLabourRateConfigure, checkRM_Process_OperationConfigurable, checkVendorPlantConfig } from './Downloadxls';
import DayTime from '../common/DayTimeWrapper'
import cloudImg from '../../assests/images/uploadcloud.png';
import { ACTUALVOLUMEBULKUPLOAD, ADDRFQ, BOP_MASTER_ID, BUDGETBULKUPLOAD, BUDGETEDVOLUMEBULKUPLOAD, CBCTypeId, CBCADDMORE, FUELBULKUPLOAD, INSERTDOMESTICBULKUPLOAD, INSERTIMPORTBULKUPLOAD, INTERESTRATEBULKUPLOAD, LABOURBULKUPLOAD, MACHINEBULKUPLOAD, MACHINE_MASTER_ID, OPERAIONBULKUPLOAD, OPERATIONS_ID, PARTCOMPONENTBULKUPLOAD, PRODUCTCOMPONENTBULKUPLOAD, VBCADDMORE, RMDOMESTICBULKUPLOAD, RMIMPORTBULKUPLOAD, RMSPECIFICATION, RM_MASTER_ID, VBCTypeId, VENDORBULKUPLOAD, ZBCADDMORE, ZBCTypeId } from '../../config/constants';
import { AddRFQUpload, BOP_CBC_DOMESTIC, BOP_CBC_IMPORT, BOP_VBC_DOMESTIC, BOP_VBC_IMPORT, BOP_ZBC_DOMESTIC, BOP_ZBC_IMPORT, BUDGET_CBC, BUDGET_VBC, BUDGET_ZBC, CBCInterestRate, CBCOperation, Fuel, Labour, MachineCBC, MachineVBC, MachineZBC, MHRMoreZBC, PartComponent, ProductComponent, RMDomesticCBC, RMDomesticVBC, RMDomesticZBC, RMImportCBC, RMImportVBC, RMImportZBC, RMSpecification, VBCInterestRate, VBCOperation, Vendor, VOLUME_ACTUAL_CBC, VOLUME_ACTUAL_VBC, VOLUME_ACTUAL_ZBC, VOLUME_BUDGETED_CBC, VOLUME_BUDGETED_VBC, VOLUME_BUDGETED_ZBC, ZBCOperation } from '../../config/masterData';
import { CheckApprovalApplicableMaster, checkForSameFileUpload, userTechnologyDetailByMasterId } from '../../helper';
import LoaderCustom from '../common/LoaderCustom';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import { checkRFQBulkUpload } from '../rfq/actions/rfq';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { checkFinalUser } from '../../components/costing/actions/Costing';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';

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
            costingTypeId: props?.fileName === "Interest Rate" ? VBCTypeId : ZBCTypeId,
            showPopup: false
        }
    }

    /**
     * @method componentDidMount
     * @description called after render the component
    */
    componentDidMount() {
        if (this.props?.masterId === RM_MASTER_ID && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
            this.props.getUsersMasterLevelAPI(loggedInUserId(), this.props?.masterId, (res) => {
                setTimeout(() => {
                    this.commonFunction()
                }, 100);
            })
        } else if (!this.props.initialConfiguration.IsMasterApprovalAppliedConfigure) {
            this.setState({ noApprovalCycle: false })
        } else {
            this.setState({ IsFinalApprover: true })
        }
        if (this.props?.masterId === BOP_MASTER_ID && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
            this.props.getUsersMasterLevelAPI(loggedInUserId(), this.props?.masterId, (res) => {
                setTimeout(() => {
                    this.commonFunction()
                }, 100);
            })
        } else if (!this.props.initialConfiguration.IsMasterApprovalAppliedConfigure) {
            this.setState({ noApprovalCycle: false })
        } else {
            this.setState({ IsFinalApprover: true })
        }
        if (this.props?.masterId === OPERATIONS_ID && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true) {
            this.props.getUsersMasterLevelAPI(loggedInUserId(), this.props?.masterId, (res) => {
                setTimeout(() => {
                    this.commonFunction()
                }, 100);
            })
        } else if (!this.props.initialConfiguration.IsMasterApprovalAppliedConfigure) {
            this.setState({ noApprovalCycle: false })
        } else {
            this.setState({ IsFinalApprover: true })
        }
        if (this.props?.masterId === MACHINE_MASTER_ID && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
            this.props.getUsersMasterLevelAPI(loggedInUserId(), this.props?.masterId, (res) => {
                setTimeout(() => {
                    this.commonFunction()
                }, 100);
            })
        } else if (!this.props.initialConfiguration.IsMasterApprovalAppliedConfigure) {
            this.setState({ noApprovalCycle: false })
        } else {
            this.setState({ IsFinalApprover: true })
        }
    }

    commonFunction() {
        let levelDetailsTemp = []
        levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId === Number(ZBCADDMORE) ? ZBCTypeId : this.state.costingTypeId === Number(VBCADDMORE) ? VBCTypeId : this.state.costingTypeId === Number(CBCADDMORE) ? CBCTypeId : this.state.costingTypeId, this.props?.masterId, this.props.userMasterLevelAPI)
        this.setState({ levelDetails: levelDetailsTemp })
        if (levelDetailsTemp?.length !== 0) {
            let obj = {
                TechnologyId: this.props?.masterId,
                DepartmentId: userDetails().DepartmentId,
                UserId: loggedInUserId(),
                Mode: 'master',
                approvalTypeId: costingTypeIdToApprovalTypeIdFunction(this.state.costingTypeId === Number(ZBCADDMORE) ? ZBCTypeId : this.state.costingTypeId === Number(VBCADDMORE) ? VBCTypeId : this.state.costingTypeId === Number(CBCADDMORE) ? CBCTypeId : this.state.costingTypeId)
            }

            this.props.checkFinalUser(obj, (res) => {
                if (res?.data?.Result) {
                    this.setState({ IsFinalApprover: res?.data?.Data?.IsFinalApprover })
                }
            })
            this.setState({ noApprovalCycle: false })
        } else {
            this.setState({ noApprovalCycle: true })
        }
    }

    /**
     * @method componentDidMount
     * @description called after render the component
    */
    componentDidUpdate(prevProps, prevState) {
        if (this.props?.masterId === RM_MASTER_ID && (prevState?.costingTypeId !== this.state.costingTypeId) && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
            this.commonFunction()
        }
        if (this.props?.masterId === BOP_MASTER_ID && (prevState?.costingTypeId !== this.state.costingTypeId) && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
            this.commonFunction()
        }
        if (this.props?.masterId === OPERATIONS_ID && (prevState?.costingTypeId !== this.state.costingTypeId) && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true) {
            this.commonFunction()
        }
        if (this.props?.masterId === MACHINE_MASTER_ID && (prevState?.costingTypeId !== this.state.costingTypeId) && this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
            this.commonFunction()
        }

    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    toggleDrawer = (event, type = 'cancel') => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.props.closeDrawer('', type);
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
        this.toggleDrawer('', 'cancel')
    }
    cancelHandler = () => {
        this.cancel()
        // this.setState({ showPopup: true })
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
                    const { fileName } = this.props;
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
                        case String(INSERTDOMESTICBULKUPLOAD):

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
                        case String(INSERTIMPORTBULKUPLOAD):
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
                        case String(BUDGETBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(BUDGET_ZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(BUDGET_VBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(BUDGET_CBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(ADDRFQ):
                            checkForFileHead = checkForSameFileUpload(AddRFQUpload, fileHeads)
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
                                    if (isDateFormatter(el)) {
                                        el = el.replaceAll('/', '-')
                                        let str = el.substring(el.indexOf("-") + 1);
                                        let month = str.substring(0, str.indexOf('-'));
                                        let year = str.substring(str.indexOf("-") + 1);
                                        const day = el.substring(0, str.indexOf('-'));
                                        let dateTemp = `${year}-${month}-${day} 00:00:00`
                                        el = dateTemp
                                    }
                                }
                                if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
                                    el = getJsDateFromExcel(el)
                                    const date = new Date();
                                    const shortDateFormat = date.toLocaleDateString(undefined, { dateStyle: 'short' });
                                    if (Number(shortDateFormat.charAt(0)) === Number(date.getMonth() + 1)) {
                                        el = DayTime(el).format('YYYY-MM-DD 00:00:00')
                                    }
                                }
                                if (fileHeads[i] === 'NoOfPcs' && typeof el == 'number') {
                                    el = parseInt(checkForNull(el))
                                }
                                if (fileHeads[i] === 'MachineSpecification') {
                                    fileHeads[i] = 'Description'
                                }
                                else if (fileHeads[i] === 'Grade') {
                                    fileHeads[i] = 'RMGrade'
                                }
                                else if (fileHeads[i] === 'Spec') {
                                    fileHeads[i] = 'RMSpec'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import') && fileHeads[i] === 'CircleSrapCost') {
                                    fileHeads[i] = 'JaliScrapCost'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import') && fileHeads[i] === 'ScrapRate/JaliScrapCost') {
                                    fileHeads[i] = 'ScrapRate'
                                }

                                if (fileHeads[i] === 'InsertPartNumber') {
                                    fileHeads[i] = 'BOPPartNumber'
                                }
                                if (fileHeads[i] === 'InsertPartName') {
                                    fileHeads[i] = 'BOPPartName'
                                }
                                if (fileHeads[i] === 'InsertCategory') {
                                    fileHeads[i] = 'BOPCategory'
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
                    failedData: Data?.FailedRecords,
                    faildRecords: true,
                })
            }

        }
        this.toggleDrawer('', 'save')
    }

    responseHandlerRFQ = (res) => {
        const { messageLabel } = this.props;
        if (res?.data?.Data) {
            if (res?.data?.Data?.SuccessRecordCount > 0) {
                Toaster.success(`${res?.data?.Data?.SuccessRecordCount} ${messageLabel} uploaded successfully.`)
            }
            if (res?.data?.Data?.FailedRecordCount > 0) {
                Toaster.warning(`Part upload failed for ${res?.data?.Data?.FailedRecordCount} records.`)
                this.setState({
                    failedData: res?.data?.Data?.FailedRecord,
                    faildRecords: true,
                })
            }
        }
        this.toggleDrawer('', 'save')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData, costingTypeId, IsFinalApprover } = this.state;
        const { fileName, typeOfEntryId } = this.props;
        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }

        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
            CostingTypeId: costingTypeId
        }

        let masterUploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
            IsFinalApprover: !this.props.initialConfiguration.IsMasterApprovalAppliedConfigure ? true : IsFinalApprover,
            CostingTypeId: costingTypeId,
            TypeOfEntry: typeOfEntryId ? typeOfEntryId : 0
        }
        if (costingTypeId === ZBCADDMORE) {
            masterUploadData.CostingTypeId = ZBCTypeId
        } else if (costingTypeId === VBCADDMORE) {
            masterUploadData.CostingTypeId = VBCTypeId
        } else if (costingTypeId === CBCADDMORE) {
            masterUploadData.CostingTypeId = CBCTypeId
        }
        this.setState({ setDisable: true })
        console.log('costingTypeId: ', costingTypeId);

        if (fileName === 'RM Domestic' || fileName === 'RM Import') {
            this.props.bulkUploadRM(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'BOP Domestic' || fileName === 'BOP Import') {
            this.props.bulkUploadBOP(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'RM Specification') {
            this.props.bulkUploadRMSpecification(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Vendor') {
            this.props.vendorBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Operation') {
            this.props.operationBulkUpload(masterUploadData, (res) => {
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
        } else if (fileName === 'Machine' && (costingTypeId === ZBCTypeId || costingTypeId === VBCTypeId || costingTypeId === CBCTypeId)) {
            this.props.bulkUploadMachine(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Machine' && (costingTypeId === ZBCADDMORE || costingTypeId === VBCADDMORE || costingTypeId === CBCADDMORE)) {
            this.props.bulkUploadMachineMoreZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'Part Component') {
            this.props.partComponentBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOP Domestic' || fileName === 'Insert Domestic') && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadBOPDomesticZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOP Domestic' || fileName === 'Insert Domestic') && costingTypeId === VBCTypeId) {
            this.props.bulkUploadBOPDomesticVBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if ((fileName === 'BOP Domestic' || fileName === 'Insert Domestic') && costingTypeId === CBCTypeId) {
            this.props.bulkUploadBOPDomesticCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOP Import' || fileName === 'Insert Import') && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadBOPImportZBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if ((fileName === 'BOP Import' || fileName === 'Insert Import') && costingTypeId === VBCTypeId) {
            this.props.bulkUploadBOPImportVBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if ((fileName === 'BOP Import' || fileName === 'Insert Import') && costingTypeId === CBCTypeId) {
            this.props.bulkUploadBOPImportCBC(masterUploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Actual Volume' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadVolumeActualZBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Actual Volume' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadVolumeActualVBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Actual Volume' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadVolumeActualCBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Budgeted Volume' && costingTypeId === ZBCTypeId) {
            this.props.bulkUploadVolumeBudgetedZBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Budgeted Volume' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadVolumeBudgetedVBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Budgeted Volume' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadVolumeBudgetedCBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Budget') {
            uploadData.CostingTypeId = costingTypeId
            uploadData.IsFinalApprover = true
            this.props.bulkUploadBudgetMaster(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Interest Rate' && costingTypeId === VBCTypeId) {
            this.props.bulkUploadInterestRateVBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'Interest Rate' && costingTypeId === CBCTypeId) {
            this.props.bulkUploadInterestRateCBC(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });

        } else if (fileName === 'Product Component') {
            this.props.productComponentBulkUpload(uploadData, (res) => {
                this.setState({ setDisable: false })
                this.responseHandler(res)
            });
        } else if (fileName === 'ADD RFQ') {
            let uploadDataRFQ = {}
            uploadDataRFQ.PartList = fileData
            uploadDataRFQ.LoggedInUserId = loggedInUserId()
            uploadDataRFQ.TechnologyId = this.props?.technologyId?.value
            this.props.checkRFQBulkUpload(uploadDataRFQ, (res) => {
                this.setState({ setDisable: false })
                this.responseHandlerRFQ(res)
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
        const { faildRecords, failedData, costingTypeId, setDisable, noApprovalCycle, IsFinalApprover } = this.state;
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
                {!this.props.isDrawerfasle ? <Drawer anchor={this.props.anchor} open={this.props.isOpen}>
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
                                            onClick={(e) => this.toggleDrawer(e, 'cancel')}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="pl-3">
                                    {isZBCVBCTemplate &&
                                        <Col md="12">
                                            {(fileName !== 'Interest Rate') && (fileName !== 'ADD RFQ') &&
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
                                            {(fileName !== 'ADD RFQ') && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingTypeId === VBCTypeId ? true : fileName === 'Interest Rate' ? true : false}
                                                    onClick={() => this.onPressHeads(VBCTypeId)}
                                                />{' '}
                                                <span>Vendor Based</span>
                                            </Label>}
                                            {(reactLocalStorage.getObject('cbcCostingPermission')) && (fileName !== 'ADD RFQ') && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingTypeId === CBCTypeId ? true : false}
                                                    onClick={() => this.onPressHeads(CBCTypeId)}
                                                />{' '}
                                                <span>Customer Based</span>
                                            </Label>}
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
                                            {isMachineMoreTemplate &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === VBCADDMORE ? true : false}
                                                        onClick={() => this.onPressHeads(VBCADDMORE)}
                                                    />{' '}
                                                    <span>VBC More Details</span>
                                                </Label>}
                                            {isMachineMoreTemplate &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === CBCADDMORE ? true : false}
                                                        onClick={() => this.onPressHeads(CBCADDMORE)}
                                                    />{' '}
                                                    <span>CBC More Details</span>
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
                                            disabled={setDisable || noApprovalCycle}
                                        >
                                            <div className={"save-icon"}></div>
                                            {isEditFlag ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer> : <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <Row className="pl-3">
                        {isZBCVBCTemplate &&
                            <Col md="12">
                                {(fileName !== 'Interest Rate') && (fileName !== 'ADD RFQ') &&
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
                                {(fileName !== 'ADD RFQ') && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        checked={costingTypeId === VBCTypeId ? true : fileName === 'Interest Rate' ? true : false}
                                        onClick={() => this.onPressHeads(VBCTypeId)}
                                    />{' '}
                                    <span>Vendor Based</span>
                                </Label>}
                                {(reactLocalStorage.getObject('cbcCostingPermission')) && (fileName !== 'ADD RFQ') && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        checked={costingTypeId === CBCTypeId ? true : false}
                                        onClick={() => this.onPressHeads(CBCTypeId)}
                                    />{' '}
                                    <span>Customer Based</span>
                                </Label>}
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
                                {isMachineMoreTemplate &&
                                    <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                        <input
                                            type="radio"
                                            name="costingHead"
                                            checked={costingTypeId === VBCADDMORE ? true : false}
                                            onClick={() => this.onPressHeads(VBCADDMORE)}
                                        />{' '}
                                        <span>VBC More Details</span>
                                    </Label>}
                                {isMachineMoreTemplate &&
                                    <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                        <input
                                            type="radio"
                                            name="costingHead"
                                            checked={costingTypeId === CBCADDMORE ? true : false}
                                            onClick={() => this.onPressHeads(CBCADDMORE)}
                                        />{' '}
                                        <span>CBC More Details</span>
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
                </form>}
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
function mapStateToProps(state) {
    const { rfq, auth } = state
    const { checkRFQPartBulkUpload } = rfq
    const { userMasterLevelAPI, initialConfiguration } = auth
    return { checkRFQPartBulkUpload, userMasterLevelAPI, initialConfiguration };
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
    bulkUploadRM,
    overheadBulkUpload,
    profitBulkUpload,
    operationBulkUpload,
    labourBulkUpload,
    bulkUploadMachine,
    bulkUploadMachineMoreZBC,
    partComponentBulkUpload,
    productComponentBulkUpload,
    bulkUploadBOP,
    bulkUploadVolumeActualZBC,
    bulkUploadVolumeActualVBC,
    bulkUploadVolumeBudgetedZBC,
    bulkUploadVolumeBudgetedVBC,
    bulkUploadInterestRateZBC,
    bulkUploadInterestRateVBC,
    bulkUploadInterestRateCBC,
    bulkUploadVolumeActualCBC,
    bulkUploadVolumeBudgetedCBC,
    bulkUploadBudgetMaster,
    checkRFQBulkUpload,
    getUsersMasterLevelAPI,
    checkFinalUser
})(reduxForm({
    form: 'BulkUpload',
    enableReinitialize: true,
    touchOnChange: true
})(BulkUpload));
