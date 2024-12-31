import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Label } from 'reactstrap';
import { checkForNull, getJsDateFromExcel, isDateFormatter, required, requiredDropDown } from "../../helper/validation";
import {
    bulkUploadRM, bulkfileUploadRM, bulkUploadRMSpecification,
    getAllMasterApprovalDepartment,
} from '../masters/actions/Material';
import { bulkUploadCommodityInIndex, bulkUploadCommodityStandard, bulkUploadIndex, bulkUploadIndexData, bulkUploadStandardizedCommodity } from '../masters/actions/Indexation'
import { bulkUploadMachine, bulkUploadMachineMoreZBC } from '../masters/actions/MachineMaster';
import { fuelBulkUpload } from '../masters/actions/Fuel';
import { labourBulkUpload } from '../masters/actions/Labour';
import { vendorBulkUpload } from '../masters/actions/Supplier';
import { overheadBulkUpload, profitBulkUpload } from '../masters/actions/OverheadProfit';
import { operationBulkUpload } from '../masters/actions/OtherOperation';
import { partComponentBulkUpload, productComponentBulkUpload } from '../masters/actions/Part';
import { bulkUploadBOP } from '../masters/actions/BoughtOutParts';
import { volumeBulkUpload } from '../masters/actions/Volume';
import { bulkUploadBudgetMaster } from '../masters/actions/Budget'
import { bulkUploadInterestRateZBC, bulkUploadInterestRateVBC, bulkUploadInterestRateCBC } from '../masters/actions/InterestRateMaster';
import Toaster from '../common/Toaster';
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId, showBopLabel, userDetails } from "../../helper/auth";
import { ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import Downloadxls, { checkInterestRateConfigure, checkLabourRateConfigure, checkRM_Process_OperationConfigurable, checkVendorPlantConfig } from './Downloadxls';
import cloudImg from '../../assests/images/uploadcloud.png';
import {
    ACTUALVOLUMEBULKUPLOAD, ADDRFQ, BOPDOMESTICBULKUPLOAD, BOPIMPORTBULKUPLOAD, BOP_MASTER_ID, BUDGETBULKUPLOAD, BUDGETEDVOLUMEBULKUPLOAD, CBCADDMORE, CBCADDMOREOPERATION, CBCTypeId, ENTRY_TYPE_IMPORT, FUELBULKUPLOAD, INTERESTRATEBULKUPLOAD, LABOURBULKUPLOAD, MACHINEBULKUPLOAD, MACHINE_MASTER_ID, OPERAIONBULKUPLOAD, OPERATIONS_ID, PARTCOMPONENTBULKUPLOAD, PRODUCTCOMPONENTBULKUPLOAD, RMDOMESTICBULKUPLOAD, RMIMPORTBULKUPLOAD, RMSPECIFICATION, RM_MASTER_ID, VBCADDMORE, VBCADDMOREOPERATION, VBCTypeId, VENDORBULKUPLOAD, ZBCADDMORE, ZBCADDMOREOPERATION, ZBCTypeId, RMMATERIALBULKUPLOAD,
    INDEXCOMMODITYBULKUPLOAD, COMMODITYININDEXBULKUPLOAD, COMMODITYSTANDARDIZATION,
    RMMASTER,
    COMMODITYSTANDARD,
    OVERHEADBULKUPLOAD,
    PROFITBULKUPLOAD,
    ASSEMBLYORCOMPONENTSRFQ,
    RAWMATERIALSRFQ,
    BOUGHTOUTPARTSRFQ,
    FILE_URL,
    SAP_PUSH
} from '../../config/constants';
//MINDA
// import { ACTUALVOLUMEBULKUPLOAD, ADDRFQ, BOPDOMESTICBULKUPLOAD, BOPIMPORTBULKUPLOAD, BOP_MASTER_ID, BUDGETBULKUPLOAD, BUDGETEDVOLUMEBULKUPLOAD, CBCADDMORE, CBCADDMOREOPERATION, CBCTypeId, ENTRY_TYPE_IMPORT, FUELBULKUPLOAD, INSERTDOMESTICBULKUPLOAD, INSERTIMPORTBULKUPLOAD, INTERESTRATEBULKUPLOAD, LABOURBULKUPLOAD, MACHINEBULKUPLOAD, MACHINE_MASTER_ID, OPERAIONBULKUPLOAD, OPERATIONS_ID, PARTCOMPONENTBULKUPLOAD, PRODUCTCOMPONENTBULKUPLOAD, VBCADDMORE, RMDOMESTICBULKUPLOAD, RMIMPORTBULKUPLOAD, RMSPECIFICATION, RM_MASTER_ID, VBCADDMOREOPERATION, VBCTypeId, VENDORBULKUPLOAD, ZBCADDMORE, ZBCADDMOREOPERATION, ZBCTypeId } from '../../config/constants';
import {
    AddRFQUpload, BOP_CBC_DOMESTIC, BOP_CBC_IMPORT, BOP_DETAILED_DOMESTIC, BOP_DETAILED_IMPORT, BOP_VBC_DOMESTIC, BOP_VBC_IMPORT, BOP_ZBC_DOMESTIC, BOP_ZBC_IMPORT, BUDGET_CBC, BUDGET_VBC, BUDGET_ZBC, CBCInterestRate, CBCOperation, CBCOperationSmallForm, DETAILED_BOP, Fuel, Labour, MachineCBC, MachineVBC, MachineZBC, MHRMoreZBC, PartComponent, ProductComponent, RMDomesticCBC, RMDomesticVBC, RMDomesticZBC, RMImportCBC, RMImportVBC, RMImportZBC, RMSpecification, VBCInterestRate, VBCOperation, VBCOperationSmallForm, Vendor, VOLUME_ACTUAL_CBC, VOLUME_ACTUAL_VBC, VOLUME_ACTUAL_ZBC, VOLUME_BUDGETED_CBC, VOLUME_BUDGETED_VBC, VOLUME_BUDGETED_ZBC, ZBCOperation, ZBCOperationSmallForm,
    IndexCommodityListing, CommodityInIndexListing, StandardizedCommodityNameListing,
    IndexDataListing,
    OverheadVBC,
    Overhead,
    OverheadCBC,
    ProfitVBC,
    Profit,
    ProfitCBC,
    CommodityStandard,
    AddRawMaterialHeaderData,
    AddBoughtOutPartsHeaderData,
    AddAssemblyOrComponentHeaderData,
    SAP_PUSH_HEADER_DATA
} from '../../config/masterData';
import { CheckApprovalApplicableMaster, checkForSameFileUpload, updateBOPValues, userTechnologyDetailByMasterId } from '../../helper';
import LoaderCustom from '../common/LoaderCustom';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import { checkBoughtOutPartsRFQBulkUpload, checkComponentOrAssemblyRFQBulkUpload, checkRawMaterialRFQBulkUpload, checkRFQBulkUpload } from '../rfq/actions/rfq';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getAllDivisionListAssociatedWithDepartment, getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { checkFinalUser } from '../../components/costing/actions/Costing';
import { costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission, OperationFileData } from '../common/CommonFunctions';
import { ENTRY_TYPE_DOMESTIC } from '../../config/constants';
import DayTime from '../common/DayTimeWrapper';
import { checkSAPCodeinExcel } from './DownloadUploadBOMxls';
import WarningMessage from '../common/WarningMessage';
import Switch from 'react-switch'
import { searchableSelect, validateForm } from '../layout/FormInputs';
import { LabelsClass, localizeHeadersWithLabels } from '../../helper/core';
import { withTranslation } from 'react-i18next';
import { sapPushBulkUpload } from '../masters/actions/SAPDetail';
const bopMasterName = showBopLabel();

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
            showPopup: false,
            bopType: '',
            isImport: false,
            isLoading: false,
            divisionList: [],
            division: '',
            department: [],
            disableDept: false,
            departmentDropDownList: [],
            isShowDivision: false,
            newfileData: [],
            checkMultiDept: false
        }
        this.localizeHeaders = this.localizeHeaders.bind(this);

    }

    localizeHeaders(headers) {
        return localizeHeadersWithLabels(headers, this.props.t);
    }

    /**
     * @method componentDidMount
     * @description called after render the component
    */
    componentDidMount() {

        this.setState({ costingTypeId: this.props?.fileName === "Interest Rate" ? VBCTypeId : getCostingTypeIdByCostingPermission() })
        this.props.getAllMasterApprovalDepartment((res) => {
            const Data = res?.data?.SelectList
            const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
            const updateList = Data && Data.filter(item => Departments.includes(item.Text))
            let department = []
            updateList &&
                updateList.map((item) => {
                    if (item?.Value === '0') return false
                    department?.push({ label: item?.Text, value: item?.Value })
                    return null
                })
            this.setState({ departmentDropDownList: department })
            if ((updateList && updateList.length === 1) || !this?.state?.checkMultiDept) {
                this.setState({ disableDept: true, department: department })
                this.props.change('dept', { label: department[0].label, value: department[0].value })
                this.callDivisionApi(department[0].value)
            }
        })
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

    commonFunction(divisionId = null) {
        let levelDetailsTemp = []
        levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId === Number(ZBCADDMORE) || this.state.costingTypeId === Number(ZBCADDMOREOPERATION) ? ZBCTypeId : this.state.costingTypeId === Number(VBCADDMORE) || this.state.costingTypeId === Number(VBCADDMOREOPERATION) ? VBCTypeId : this.state.costingTypeId === Number(CBCADDMORE) || this.state.costingTypeId === Number(CBCADDMOREOPERATION) ? CBCTypeId : this.state.bopType === DETAILED_BOP ? VBCTypeId : this.state.costingTypeId, this.props?.masterId, this.props.userMasterLevelAPI)
        this.setState({ levelDetails: levelDetailsTemp })
        let obj = {
            TechnologyId: this.props?.masterId,
            DepartmentId: userDetails().DepartmentId,
            UserId: loggedInUserId(),
            Mode: 'master',
            approvalTypeId: costingTypeIdToApprovalTypeIdFunction(this.state.costingTypeId === Number(ZBCADDMORE) || this.state.costingTypeId === Number(ZBCADDMOREOPERATION) ? ZBCTypeId : this.state.costingTypeId === Number(VBCADDMORE) || this.state.costingTypeId === Number(VBCADDMOREOPERATION) ? VBCTypeId : this.state.costingTypeId === Number(CBCADDMORE) || this.state.costingTypeId === Number(CBCADDMOREOPERATION) ? CBCTypeId : this.state.bopType === DETAILED_BOP ? VBCTypeId : this.state.costingTypeId),
            divisionId: divisionId
        }
        if (!this.props.initialConfiguration.IsMultipleUserAllowForApproval) {
            this.props.checkFinalUser(obj, (res) => {
                if (res?.data?.Result) {
                    this.setState({ IsFinalApprover: res?.data?.Data?.IsFinalApprover })
                }
                if (res?.data?.Data?.IsUserInApprovalFlow === false) {
                    this.setState({ noApprovalCycle: true })
                } else {
                    this.setState({ noApprovalCycle: false })
                }
            })
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
    callDivisionApi = (deptId) => {
        let obj = {
            DepartmentIdList: [deptId],
            IsApproval: false
        }
        this.props.getAllDivisionListAssociatedWithDepartment(obj, res => {
            if (res && res?.data && res?.data?.Identity === true) {
                this.setState({ isShowDivision: true })
                let divisionArray = []
                res?.data?.DataList?.map(item => {
                    if (String(item?.DivisionId) !== '0') {
                        divisionArray.push({ label: `${item.DivisionNameCode}`, value: (item?.DivisionId)?.toString(), DivisionCode: item?.DivisionCode })
                    }
                    return null;
                })
                this.setState({ divisionList: divisionArray })
            } else {
                this.setState({ isShowDivision: false })
                this.setState({ divisionList: [] })
            }
        })
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    toggleDrawer = (event, type = 'cancel', identityKey = null) => {

        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.setState({ isLoading: false });

        this.props.closeDrawer('', type, identityKey);
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
    onPressHeads = (costingHeadFlag, bopType) => {
        setTimeout(() => {
            this.setState({ costingTypeId: costingHeadFlag, fileData: [], uploadfileName: "", bopType: bopType });
        }, 300);
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

        this.setState({ bulkUploadLoader: true })
        let fileObj = event.target.files[0];
        let masterDataArray = []
        let fileHeads = [];
        let uploadfileName = fileObj?.name;

        let fileType = uploadfileName?.substr(uploadfileName.indexOf('.'));
        this.setState({ newfileData: fileObj })
        let VendorLabel = LabelsClass(this.props.t, 'MasterLabels').vendorLabel;

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
                    const { fileName, selectedOption } = this.props;
                    switch (String(this.props.fileName)) {
                        case String(RMMASTER):
                            if (!this.state.isImport) {
                                if (this.state.costingTypeId === ZBCTypeId) {
                                    const localizedRMDomesticZBC = this.localizeHeaders(RMDomesticZBC);
                                    masterDataArray = localizedRMDomesticZBC
                                    checkForFileHead = checkForSameFileUpload(checkRM_Process_OperationConfigurable(localizedRMDomesticZBC, ZBCTypeId), fileHeads, true)
                                }
                                else if (this.state.costingTypeId === VBCTypeId) {
                                    const localizedRMDomesticVBC = this.localizeHeaders(RMDomesticVBC);
                                    masterDataArray = localizedRMDomesticVBC
                                    checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedRMDomesticVBC, VBCTypeId), fileHeads, true)
                                }
                                else if (this.state.costingTypeId === CBCTypeId) {
                                    const localizedRMDomesticCBC = this.localizeHeaders(RMDomesticCBC);
                                    masterDataArray = localizedRMDomesticCBC
                                    checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedRMDomesticCBC, CBCTypeId), fileHeads, true)
                                }
                            } else {
                                if (this.state.costingTypeId === ZBCTypeId) {
                                    const localizedRMImportZBC = this.localizeHeaders(RMImportZBC);
                                    masterDataArray = localizedRMImportZBC
                                    checkForFileHead = checkForSameFileUpload(checkRM_Process_OperationConfigurable(localizedRMImportZBC, ZBCTypeId), fileHeads, true)
                                }
                                else if (this.state.costingTypeId === VBCTypeId) {
                                    const localizedRMImportVBC = this.localizeHeaders(RMImportVBC);
                                    masterDataArray = localizedRMImportVBC
                                    checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedRMImportVBC, VBCTypeId), fileHeads, true)
                                }
                                else if (this.state.costingTypeId === CBCTypeId) {
                                    const localizedRMImportCBC = this.localizeHeaders(RMImportCBC);
                                    masterDataArray = localizedRMImportCBC
                                    checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedRMImportCBC, CBCTypeId), fileHeads, true)
                                }
                            }
                            break;
                        case String(RMSPECIFICATION):
                            const localizedRMSpecification = this.localizeHeaders(RMSpecification);
                            masterDataArray = localizedRMSpecification
                            checkForFileHead = checkForSameFileUpload(localizedRMSpecification, fileHeads)
                            break;
                        case String(BOPDOMESTICBULKUPLOAD):

                            //MINDA
                            // case String(INSERTDOMESTICBULKUPLOAD):

                            if (this.state.costingTypeId === VBCTypeId) {
                                const localizedBOPVBC = this.localizeHeaders(BOP_VBC_DOMESTIC);
                                masterDataArray = localizedBOPVBC
                                const { updatedLabels } = updateBOPValues(localizedBOPVBC, [], bopMasterName, 'label')
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels, VBCTypeId), fileHeads, true)
                            }
                            else if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedBOPZBC = this.localizeHeaders(BOP_ZBC_DOMESTIC);
                                masterDataArray = localizedBOPZBC
                                const { updatedLabels } = updateBOPValues(localizedBOPZBC, [], bopMasterName, 'label')
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels), fileHeads, true)

                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedBOPCBC = this.localizeHeaders(BOP_CBC_DOMESTIC);
                                masterDataArray = localizedBOPCBC
                                const { updatedLabels } = updateBOPValues(localizedBOPCBC, [], bopMasterName, 'label')

                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels), fileHeads, true)

                            } else if (this.state.bopType === DETAILED_BOP) {

                                const localizedBOPDetailed = this.localizeHeaders(BOP_DETAILED_DOMESTIC);
                                masterDataArray = localizedBOPDetailed
                                const { updatedLabels } = updateBOPValues(localizedBOPDetailed, [], bopMasterName, 'label')


                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels), fileHeads, true)
                            }
                            break;
                        case String(BOPIMPORTBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedBOPZBC = this.localizeHeaders(BOP_ZBC_IMPORT);
                                masterDataArray = localizedBOPZBC
                                const { updatedLabels } = updateBOPValues(localizedBOPZBC, [], bopMasterName, 'label')

                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels), fileHeads, true)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                const localizedBOPVBC = this.localizeHeaders(BOP_VBC_IMPORT);
                                masterDataArray = localizedBOPVBC
                                const { updatedLabels } = updateBOPValues(localizedBOPVBC, [], bopMasterName, 'label')

                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels, VBCTypeId), fileHeads, true)
                            } else if (this.state.bopType === DETAILED_BOP) {
                                const localizedBOPDetailed = this.localizeHeaders(BOP_DETAILED_IMPORT);
                                masterDataArray = localizedBOPDetailed
                                const { updatedLabels } = updateBOPValues(localizedBOPDetailed, [], bopMasterName, 'label')

                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels), fileHeads, true)
                            } else {
                                const localizedBOPCBC = this.localizeHeaders(BOP_CBC_IMPORT);
                                masterDataArray = localizedBOPCBC
                                const { updatedLabels } = updateBOPValues(localizedBOPCBC, [], bopMasterName, 'label')

                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels, CBCTypeId), fileHeads, true)
                            }
                            break;
                        case String(PARTCOMPONENTBULKUPLOAD):
                            const localizedPartComponent = this.localizeHeaders(PartComponent);
                            masterDataArray = localizedPartComponent
                            checkForFileHead = checkForSameFileUpload(checkSAPCodeinExcel(localizedPartComponent), fileHeads)
                            break;
                        case String(PRODUCTCOMPONENTBULKUPLOAD):
                            const localizedProductComponent = this.localizeHeaders(ProductComponent);
                            masterDataArray = localizedProductComponent
                            checkForFileHead = checkForSameFileUpload(checkSAPCodeinExcel(localizedProductComponent), fileHeads)
                            break;
                        case String(MACHINEBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedMachineZBC = this.localizeHeaders(MachineZBC);
                                masterDataArray = localizedMachineZBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedMachineZBC, ZBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                const localizedMachineVBC = this.localizeHeaders(MachineVBC);
                                masterDataArray = localizedMachineVBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedMachineVBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedMachineCBC = this.localizeHeaders(MachineCBC);
                                masterDataArray = localizedMachineCBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedMachineCBC, ZBCTypeId), fileHeads)
                            }
                            else {
                                const localizedMHRMoreZBC = this.localizeHeaders(MHRMoreZBC);
                                masterDataArray = localizedMHRMoreZBC
                                checkForFileHead = checkForSameFileUpload(checkRM_Process_OperationConfigurable(localizedMHRMoreZBC, ZBCTypeId), fileHeads)
                            }
                            break;
                        case String(VENDORBULKUPLOAD):
                            const localizedVendor = this.localizeHeaders(Vendor);
                            masterDataArray = localizedVendor
                            const { updatedLabels } = updateBOPValues(localizedVendor, [], bopMasterName, 'label')

                            checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(updatedLabels, '', '', true), fileHeads)
                            break;
                        case String(LABOURBULKUPLOAD):
                            const localizedLabour = this.localizeHeaders(Labour);
                            masterDataArray = localizedLabour
                            checkForFileHead = checkForSameFileUpload(localizedLabour, fileHeads)
                            break;
                        case String(OPERAIONBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedZBCOperationSmallForm = this.localizeHeaders(ZBCOperationSmallForm);
                                masterDataArray = localizedZBCOperationSmallForm
                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(localizedZBCOperationSmallForm), fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                const localizedVBCOperationSmallForm = this.localizeHeaders(VBCOperationSmallForm);
                                masterDataArray = localizedVBCOperationSmallForm
                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(localizedVBCOperationSmallForm), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedCBCOperationSmallForm = this.localizeHeaders(CBCOperationSmallForm);
                                masterDataArray = localizedCBCOperationSmallForm
                                checkForFileHead = checkForSameFileUpload(checkLabourRateConfigure(localizedCBCOperationSmallForm), fileHeads)
                            }
                            else if (this.state.costingTypeId === ZBCADDMOREOPERATION) {
                                const localizedZBCOperation = this.localizeHeaders(ZBCOperation);
                                masterDataArray = localizedZBCOperation
                                checkForFileHead = checkForSameFileUpload(localizedZBCOperation, fileHeads)
                            } else if (this.state.costingTypeId === VBCADDMOREOPERATION) {
                                const localizedVBCOperation = this.localizeHeaders(VBCOperation);
                                masterDataArray = localizedVBCOperation
                                checkForFileHead = checkForSameFileUpload(localizedVBCOperation, fileHeads)
                            } else if (this.state.costingTypeId === CBCADDMOREOPERATION) {
                                const localizedCBCOperation = this.localizeHeaders(CBCOperation);
                                masterDataArray = localizedCBCOperation
                                checkForFileHead = checkForSameFileUpload(localizedCBCOperation, fileHeads)
                            }
                            break;
                        case String(FUELBULKUPLOAD):
                            const localizedFuel = this.localizeHeaders(Fuel);
                            masterDataArray = localizedFuel
                            checkForFileHead = checkForSameFileUpload(localizedFuel, fileHeads)
                            break;
                        case String(INTERESTRATEBULKUPLOAD):
                            if (this.state.costingTypeId === VBCTypeId) {
                                const localizedVBCInterestRate = this.localizeHeaders(VBCInterestRate);
                                masterDataArray = localizedVBCInterestRate
                                checkForFileHead = checkForSameFileUpload(checkInterestRateConfigure(localizedVBCInterestRate), fileHeads)

                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedCBCInterestRate = this.localizeHeaders(CBCInterestRate);
                                masterDataArray = localizedCBCInterestRate
                                checkForFileHead = checkForSameFileUpload(checkInterestRateConfigure(localizedCBCInterestRate), fileHeads)
                            }
                            break;
                        case String(ACTUALVOLUMEBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedVOLUME_ACTUAL_ZBC = this.localizeHeaders(VOLUME_ACTUAL_ZBC);
                                masterDataArray = localizedVOLUME_ACTUAL_ZBC
                                checkForFileHead = checkForSameFileUpload(localizedVOLUME_ACTUAL_ZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                const localizedVOLUME_ACTUAL_VBC = this.localizeHeaders(VOLUME_ACTUAL_VBC);
                                masterDataArray = localizedVOLUME_ACTUAL_VBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedVOLUME_ACTUAL_VBC, VBCTypeId), fileHeads)
                            }
                            else {
                                const localizedVOLUME_ACTUAL_CBC = this.localizeHeaders(VOLUME_ACTUAL_CBC);
                                masterDataArray = localizedVOLUME_ACTUAL_CBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedVOLUME_ACTUAL_CBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(BUDGETEDVOLUMEBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedVOLUME_BUDGETED_ZBC = this.localizeHeaders(VOLUME_BUDGETED_ZBC);
                                masterDataArray = localizedVOLUME_BUDGETED_ZBC
                                checkForFileHead = checkForSameFileUpload(localizedVOLUME_BUDGETED_ZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                const localizedVOLUME_BUDGETED_VBC = this.localizeHeaders(VOLUME_BUDGETED_VBC);
                                masterDataArray = localizedVOLUME_BUDGETED_VBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedVOLUME_BUDGETED_VBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedVOLUME_BUDGETED_CBC = this.localizeHeaders(VOLUME_BUDGETED_CBC);
                                masterDataArray = localizedVOLUME_BUDGETED_CBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedVOLUME_BUDGETED_CBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(BUDGETBULKUPLOAD):
                            if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedBUDGET_ZBC = this.localizeHeaders(BUDGET_ZBC);
                                masterDataArray = localizedBUDGET_ZBC
                                checkForFileHead = checkForSameFileUpload(localizedBUDGET_ZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === VBCTypeId) {
                                const localizedBUDGET_VBC = this.localizeHeaders(BUDGET_VBC);
                                masterDataArray = localizedBUDGET_VBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedBUDGET_VBC, VBCTypeId), fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedBUDGET_CBC = this.localizeHeaders(BUDGET_CBC);
                                masterDataArray = localizedBUDGET_CBC
                                checkForFileHead = checkForSameFileUpload(checkVendorPlantConfig(localizedBUDGET_CBC, CBCTypeId), fileHeads)
                            }
                            break;
                        case String(ASSEMBLYORCOMPONENTSRFQ):
                            checkForFileHead = checkForSameFileUpload(AddAssemblyOrComponentHeaderData, fileHeads)
                            break
                        case String(BOUGHTOUTPARTSRFQ):
                            checkForFileHead = checkForSameFileUpload(AddBoughtOutPartsHeaderData, fileHeads)

                            break
                        case String(RAWMATERIALSRFQ):

                            checkForFileHead = checkForSameFileUpload(AddRawMaterialHeaderData, fileHeads)

                            break





                        //checkForFileHead = checkForSameFileUpload(AddRFQUpload, fileHeads)


                        case String(OVERHEADBULKUPLOAD):
                            if (this.state.costingTypeId === VBCTypeId) {
                                const localizedOverheadVBC = this.localizeHeaders(OverheadVBC);
                                masterDataArray = localizedOverheadVBC
                                checkForFileHead = checkForSameFileUpload(localizedOverheadVBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedOverheadZBC = this.localizeHeaders(Overhead);
                                masterDataArray = localizedOverheadZBC
                                checkForFileHead = checkForSameFileUpload(localizedOverheadZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedOverheadCBC = this.localizeHeaders(OverheadCBC);
                                masterDataArray = localizedOverheadCBC
                                checkForFileHead = checkForSameFileUpload(localizedOverheadCBC, fileHeads)
                            }
                            break;
                        case String(PROFITBULKUPLOAD):
                            if (this.state.costingTypeId === VBCTypeId) {
                                const localizedProfitVBC = this.localizeHeaders(ProfitVBC);
                                masterDataArray = localizedProfitVBC
                                checkForFileHead = checkForSameFileUpload(localizedProfitVBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === ZBCTypeId) {
                                const localizedProfitZBC = this.localizeHeaders(Profit);
                                masterDataArray = localizedProfitZBC
                                checkForFileHead = checkForSameFileUpload(localizedProfitZBC, fileHeads)
                            }
                            else if (this.state.costingTypeId === CBCTypeId) {
                                const localizedProfitCBC = this.localizeHeaders(ProfitCBC);
                                masterDataArray = localizedProfitCBC
                                checkForFileHead = checkForSameFileUpload(localizedProfitCBC, fileHeads)
                            }
                            break;
                        case String(RMMATERIALBULKUPLOAD):
                            const localizedIndexDataListing = this.localizeHeaders(IndexDataListing);
                            masterDataArray = localizedIndexDataListing
                            checkForFileHead = checkForSameFileUpload(localizedIndexDataListing, fileHeads)
                            break;
                        case String(INDEXCOMMODITYBULKUPLOAD):
                            const localizedIndexCommodityListing = this.localizeHeaders(IndexCommodityListing);
                            masterDataArray = localizedIndexCommodityListing
                            checkForFileHead = checkForSameFileUpload(localizedIndexCommodityListing, fileHeads)
                            break;
                        case String(COMMODITYININDEXBULKUPLOAD):
                            const localizedCommodityInIndexListing = this.localizeHeaders(CommodityInIndexListing);
                            masterDataArray = localizedCommodityInIndexListing
                            checkForFileHead = checkForSameFileUpload(localizedCommodityInIndexListing, fileHeads)
                            break;
                        case String(COMMODITYSTANDARDIZATION):
                            const localizedStandardizedCommodityNameListing = this.localizeHeaders(StandardizedCommodityNameListing);
                            masterDataArray = localizedStandardizedCommodityNameListing
                            checkForFileHead = checkForSameFileUpload(localizedStandardizedCommodityNameListing, fileHeads)
                            break;
                        case String(COMMODITYSTANDARD):
                            const localizedCommodityStandard = this.localizeHeaders(CommodityStandard);
                            masterDataArray = localizedCommodityStandard
                            checkForFileHead = checkForSameFileUpload(localizedCommodityStandard, fileHeads)
                            break;
                        case String(SAP_PUSH):
                            const localizedSAPPush = this.localizeHeaders(SAP_PUSH_HEADER_DATA);
                            masterDataArray = localizedSAPPush
                            checkForFileHead = checkForSameFileUpload(localizedSAPPush, fileHeads)
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
                    resp?.rows?.map((val, index) => {

                        if (index > 0 && val?.length > 0) {
                            // BELOW CODE FOR HANDLE EMPTY CELL VALUE
                            const i = val.findIndex(e => e === undefined);
                            if (i !== -1) {
                                val[i] = '';
                            }

                            if ((fileName === 'Operation' || fileName === 'RM' || fileName === 'RM Domestic' || fileName === 'RM Import') && val.length === 1) {
                                return null
                            }

                            let obj = {}
                            val.map((el, i) => {

                                if ((fileHeads[i] === 'EffectiveDate' || fileHeads[i] === 'DateOfPurchase' || fileHeads[i] === 'Indexed On') && typeof el === 'string' && el !== '') {
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
                                if ((fileHeads[i] === 'EffectiveDate' || fileHeads[i] === 'DateOfPurchase' || fileHeads[i] === 'DateOfModification' || fileHeads[i] === 'Indexed On') && typeof el === 'number') {
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
                                // if (fileHeads[i] === 'MachineSpecification') {
                                //     fileHeads[i] = 'Description'
                                // }
                                else if (fileHeads[i] === 'Grade') {
                                    fileHeads[i] = 'RMGrade'
                                }
                                else if (fileHeads[i] === 'Spec') {
                                    fileHeads[i] = 'RMSpec'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'RM') && fileHeads[i] === 'CircleScrapRate') {
                                    fileHeads[i] = 'JaliScrapCost'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'RM') && fileHeads[i] === 'ScrapRate/JaliScrapRate/ForgingScrapRate') {
                                    fileHeads[i] = 'ScrapRate'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'RM') && fileHeads[i] === 'ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM') {
                                    fileHeads[i] = 'ScrapRatePerScrapUOM'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'RM' || fileName === `${showBopLabel()} Domestic` || fileName === `${showBopLabel()} Import`) && fileHeads[i] === 'PlantCode') {
                                    // } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'BOP Domestic' || fileName === 'BOP Import' || fileName === 'Insert Domestic' || fileName === 'Insert Import') && fileHeads[i] === 'PlantCode') {
                                    fileHeads[i] = 'DestinationPlantCode'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'RM') && fileHeads[i] === 'PlantName') {
                                    fileHeads[i] = 'DestinationPlantName'
                                } else if ((fileName === `${showBopLabel()} Domestic` || fileName === `${showBopLabel()} Import`) && fileHeads[i] === 'MinimumOrderQuantity') {
                                    fileHeads[i] = 'NumberOfPieces'
                                }
                                if (fileHeads[i] === `${showBopLabel()}PartNumber` || fileHeads[i] === 'BOPNumber' || fileHeads[i] === `${showBopLabel()}Number`) {
                                    fileHeads[i] = 'BoughtOutPartNumber'
                                }
                                if (fileHeads[i] === `${showBopLabel()}PartName` || fileHeads[i] === 'BOPName' || fileHeads[i] === `${showBopLabel()}Name`) {

                                    fileHeads[i] = 'BoughtOutPartName'

                                }
                                if (fileHeads[i] === `${showBopLabel()}${VendorLabel}`) {
                                    fileHeads[i] = `BOP${VendorLabel}`
                                }
                                if (fileHeads[i] === `${showBopLabel()}Category`) {
                                    fileHeads[i] = 'CategoryName'
                                }
                                if (fileHeads[i] === 'MinimumOrderQuantity') {
                                    fileHeads[i] = 'NumberOfPieces'
                                }
                                if (fileHeads[i] === `${showBopLabel()}${VendorLabel}`) {
                                    fileHeads[i] = `BOP${VendorLabel}`
                                }
                                if (fileName === 'Product Component' && fileHeads[i] === 'PreferredForImpactCalculation') {
                                    fileHeads[i] = 'IsConsideredForMBOM'
                                }
                                else if (fileHeads[i] === 'Spec') {
                                    fileHeads[i] = 'RMSpec'
                                } else if ((fileName === 'RM Domestic' || fileName === 'RM Import' || fileName === 'RM') && fileHeads[i] === 'Code') {
                                    fileHeads[i] = 'RawMaterialCode'
                                }
                                if (fileName === `${VendorLabel}` && fileHeads[i] === 'PlantCode') {
                                    fileHeads[i] = 'Plants'
                                }
                                if (fileName === `${VendorLabel}` && fileHeads[i] === `Potential ${VendorLabel}`) {
                                    fileHeads[i] = `IsCritical${VendorLabel}`
                                }
                                if (fileHeads[i] === 'BOPNumber') {
                                    fileHeads[i] = 'BoughtOutPartNumber'
                                }
                                if (fileHeads[i] === 'BOPName') {
                                    fileHeads[i] = 'BoughtOutPartName'
                                }
                                if (fileHeads[i] === `ClientApproved${VendorLabel}`) {
                                    fileHeads[i] = `IsClient${VendorLabel}BOP`
                                }
                                if (fileHeads[i] === 'Efficiency (%)') {
                                    fileHeads[i] = 'EfficiencyPercentage'
                                }
                                if (fileName === 'Operation' && fileHeads[i] === 'OperationType') {
                                    fileHeads[i] = 'ForType'
                                }
                                if (fileName === 'Operation' && fileHeads[i] === 'WeldingMaterialRate/kg') {
                                    fileHeads[i] = 'OperationBasicRate'
                                }
                                if (fileName === 'Operation' && fileHeads[i] === 'Consumption') {
                                    fileHeads[i] = 'OperationConsumption'
                                }
                                if (fileName === 'Operation' && fileHeads[i] === 'LabourRate') {
                                    fileHeads[i] = 'LabourRatePerUOM'
                                }
                                if (fileHeads[i] === 'Index') {
                                    fileHeads[i] = 'IndexExchangeName'
                                }
                                if (fileHeads[i] === 'Commodity (In Index)' || fileHeads[i] === 'Commodity Name (In Index)') {
                                    fileHeads[i] = 'CommodityName'
                                }
                                if (fileHeads[i] === 'Commodity Name (Standard)' || fileHeads[i] === 'Commodity Name (In CIR)') {
                                    fileHeads[i] = 'CommodityStandardName'
                                }
                                if (fileHeads[i] === 'Index Rate (From Currency)') {
                                    fileHeads[i] = 'Rate'
                                }
                                if (fileHeads[i] === 'Index UOM') {
                                    fileHeads[i] = 'UOM'
                                }
                                if (fileHeads[i] === 'Conversion Rate (INR)') {
                                    fileHeads[i] = 'RateConversion'
                                }
                                if (fileHeads[i] === 'Indexed On') {
                                    fileHeads[i] = 'EffectiveDate'
                                }
                                if (fileHeads[i] === 'From Currency') {
                                    fileHeads[i] = 'FromCurrency'
                                }
                                if (fileHeads[i] === 'To Currency') {
                                    fileHeads[i] = 'ToCurrency'
                                }
                                if (fileHeads[i] === `IsBreakup${showBopLabel()}`) {
                                    fileHeads[i] = `IsBreakupBoughtOutPart`
                                }
                                if (fileHeads[i] === 'OverheadRMCost/PartCost') {
                                    fileHeads[i] = 'OverheadRMPercentage'
                                }
                                if (fileHeads[i] === 'ProfitRMCost/PartCost') {
                                    fileHeads[i] = 'ProfitRMPercentage'
                                }
                                const key = this.getValueFromMasterData(fileHeads[i], masterDataArray)

                                obj[key] = el;
                                return null;
                            })
                            if ((fileName === `${showBopLabel()} Domestic` || fileName === `${showBopLabel()} Import`) && this.state.costingTypeId === VBCTypeId && this.state.bopType !== DETAILED_BOP) {
                                obj.IsBreakupBoughtOutPart = "No"
                            }
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
        let identityKey = null;
        if (res.status === 400) {
            let Data = res.data.Data
            const withOutTild = Data?.FileURL?.replace("~", "");
            const fileURL = `${FILE_URL}${withOutTild}`;
            window.open(fileURL, '_blank');
        } else {
            identityKey = res?.data?.Identity;
            Toaster.success(`RFQ uploaded successfully.`)
        }
        // if (res?.data?.Data?.FailedRecordCount > 0) {
        //     Toaster.warning(`Part upload failed for ${res?.data?.Data?.FailedRecordCount} records.`)
        //     this.setState({
        //         failedData: res?.data?.Data?.FailedRecord,
        //         faildRecords: true,
        //     })
        // }

        this.toggleDrawer('', 'save', identityKey)
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData, costingTypeId, IsFinalApprover, bopType, newfileData } = this.state;


        const { fileName, typeOfEntryId, selectedOption } = this.props;


        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }
        const operationData = OperationFileData(fileData)
        const updatedFileData = operationData.map(record => {
            const detailedEntry = fileName === 'Operation' &&
                (costingTypeId === ZBCADDMOREOPERATION || costingTypeId === VBCADDMOREOPERATION || costingTypeId === CBCADDMOREOPERATION);
            return {
                ...record,
                DetailedEntry: detailedEntry ? 'YES' : 'NO',

            };
        });
        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
            CostingTypeId: costingTypeId,
            bopType: bopType
        }

        let masterUploadData = {
            Records: fileName === 'Operation' ? updatedFileData : fileData,
            LoggedInUserId: loggedInUserId(),
            IsFinalApprover: !this.props.initialConfiguration.IsMasterApprovalAppliedConfigure ? true : IsFinalApprover,
            CostingTypeId: costingTypeId,
            TypeOfEntry: this.props.masterId === RM_MASTER_ID && this.state.isImport ? ENTRY_TYPE_IMPORT : typeOfEntryId ? typeOfEntryId : 0,
            DivisionId: this.state.division?.value,
            DepartmentId: this.state.disableDept ? this.state.department[0].value : this.state.department?.value
        }
        if (costingTypeId === ZBCADDMORE || costingTypeId === ZBCADDMOREOPERATION) {
            masterUploadData.CostingTypeId = ZBCTypeId
        } else if (costingTypeId === VBCADDMORE || costingTypeId === VBCADDMOREOPERATION) {
            masterUploadData.CostingTypeId = VBCTypeId
        } else if (costingTypeId === CBCADDMORE || costingTypeId === CBCADDMOREOPERATION) {
            masterUploadData.CostingTypeId = CBCTypeId
        }
        this.setState({ setDisable: true, isLoading: true }, () => {
            if (fileName === 'Actual Volume') {
                uploadData.TypeOfEntry = ENTRY_TYPE_DOMESTIC
            } else if (fileName === 'Budgeted Volume') {
                uploadData.TypeOfEntry = ENTRY_TYPE_IMPORT
            }
            if (fileName === 'RM') {
                this.props.bulkUploadRM(masterUploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            } else if (fileName === `${showBopLabel()} Domestic` || fileName === `${showBopLabel()} Import`) {
                // } else if (fileName === 'BOP Domestic' || fileName === 'BOP Import' || fileName === 'Insert Domestic' || fileName === 'Insert Import') {
                masterUploadData.CostingTypeId = (bopType === DETAILED_BOP ? VBCTypeId : masterUploadData.CostingTypeId)
                this.props.bulkUploadBOP(masterUploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            } else if (fileName === 'RM Specification') {
                this.props.bulkUploadRMSpecification(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            } else if (fileName === 'Index') {
                this.props.bulkUploadIndex(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            }
            else if (fileName === 'Commodity (In Index)') {
                this.props.bulkUploadCommodityInIndex(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            }
            else if (fileName === 'Commodity Standardization') {
                this.props.bulkUploadStandardizedCommodity(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            }
            else if (fileName === 'Index Data') {
                this.props.bulkUploadIndexData(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            } else if (fileName === 'Commodity Standard') {
                this.props.bulkUploadCommodityStandard(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });
            }
            else if (fileName === 'Vendor') {
                this.props.vendorBulkUpload(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });

            }
            else if (fileName === 'Operation') {
                this.props.operationBulkUpload(masterUploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });
            }
            else if (fileName === 'Fuel') {
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
            } else if (fileName === SAP_PUSH) {
                this.props.sapPushBulkUpload(uploadData, (res) => {
                    this.setState({ setDisable: false })
                    this.responseHandler(res)
                });
            } else if (fileName === 'Actual Volume' || fileName === 'Budgeted Volume') {
                this.props.volumeBulkUpload(uploadData, (res) => {
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
            } else if (fileName === ASSEMBLYORCOMPONENTSRFQ || fileName === RAWMATERIALSRFQ || fileName === BOUGHTOUTPARTSRFQ) {
                let data = new FormData()

                data.append('file', newfileData)

                data.append('loggedInUserId', loggedInUserId())
                // uploadDataRFQ.TechnologyId = this.props?.technologyId?.value
                switch (selectedOption) {
                    case "Bought Out Part":
                        this.props.checkBoughtOutPartsRFQBulkUpload(data, (res) => {
                            this.setState({ setDisable: false })
                            this.responseHandlerRFQ(res)
                        });
                        break
                    case "Raw Material":
                        this.props.checkRawMaterialRFQBulkUpload(data, (res) => {
                            this.setState({ setDisable: false })
                            this.responseHandlerRFQ(res)
                        });
                        break
                    case "componentAssembly":
                        this.props.checkComponentOrAssemblyRFQBulkUpload(data, (res) => {
                            this.setState({ setDisable: false })
                            this.responseHandlerRFQ(res)
                        });
                        break



                    default:
                        return
                }
                // this.props.checkRFQBulkUpload(uploadDataRFQ, (res) => {
                //     this.setState({ setDisable: false })
                //     this.responseHandlerRFQ(res)
                // });
            }

            else {
                this.setState({ setDisable: false, isLoading: false })
            }
        })


    }
    /**
* @method onRmToggle
* @description RM TOGGLE
*/
    onRmToggle = () => {
        this.setState({
            isImport: !this.state.isImport,
        })
    }
    handleDepartmentChange = (e) => {
        this.setState({ department: e, division: '' })
        this.props.change('Division', { label: '', value: '' })
        this.callDivisionApi(e.value)

    }
    handleDivision = (e) => {
        this.setState({ division: e })
    }
    /**
     * @method render
     * @description Renders the component
     */
    render() {
        const { handleSubmit, isEditFlag, fileName, messageLabel, isZBCVBCTemplate = '', isMachineMoreTemplate, selectedOption = "", modelText } = this.props;
        let VendorLabel = LabelsClass(this.props.t, 'MasterLabels').vendorLabel;

        const { faildRecords, failedData, costingTypeId, setDisable, noApprovalCycle, bopType } = this.state;
        if (faildRecords) {

            return <Downloadxls
                isFailedFlag={true}
                fileName={fileName}
                failedData={failedData}
                costingTypeId={costingTypeId}
                bopType={bopType}
                isImport={this.state.isImport}
                selectedOption={selectedOption}
                modelText={modelText}
            />
        }
        return (
            <>
                {!this.props.isDrawerfasle ? <Drawer anchor={this.props.anchor} open={this.props.isOpen}>
                    <Container>
                        <div className={'drawer-wrapper WIDTH-400'}>
                            {this.state.isLoading && (
                                <div className="loader-overlay">
                                    <LoaderCustom customClass="attachment-loader" />
                                </div>
                            )}

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
                                <Row>
                                    {fileName === 'RM' &&
                                        <Col md="4" className="switch mb15">
                                            <label className="switch-level">
                                                <div className={"left-title"}>Domestic</div>
                                                <Switch
                                                    onChange={this.onRmToggle}
                                                    checked={this.state.isImport}
                                                    id="normal-switch"
                                                    disabled={false}
                                                    background="#4DC771"
                                                    onColor="#4DC771"
                                                    onHandleColor="#ffffff"
                                                    offColor="#4DC771"
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    height={20}
                                                    width={46}
                                                />
                                                <div className={"right-title"}>Import</div>
                                            </label>
                                        </Col>
                                    }
                                </Row>
                                <Row>
                                    {getConfigurationKey().IsDivisionAllowedForDepartment && (fileName === 'RM' || fileName === `${showBopLabel()} Domestic` || fileName === `${showBopLabel()} Import` || fileName === 'Operation' || fileName === 'Budget' || fileName === 'Machine') && <>

                                        {/* <Col md="6" className='dropdown-flex'>
                                            <Field
                                                label={`${handleDepartmentHeader()}`}
                                                name={"dept"}
                                                placeholder={"Select"}
                                                type="text"
                                                component={searchableSelect}
                                                options={this.state.departmentDropDownList}
                                                validate={this.state.department == null || this.state.department?.length === 0 ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleDepartmentChange}
                                                valueDescription={this.state.department}
                                                disabled={this.state.disableDept}
                                            />
                                        </Col> */}
                                        {this.state.isShowDivision && <Col md="6" className='dropdown-flex'>
                                            <Field
                                                label={"Division"}
                                                name={"Division"}
                                                placeholder={"Select"}
                                                type="text"
                                                component={searchableSelect}
                                                options={this.state.divisionList}
                                                validate={this.state.division == null || this.state.division?.length === 0 ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleDivision}
                                                valueDescription={this.state.division}
                                                disabled={false}
                                            />
                                        </Col>}

                                    </>}
                                </Row>
                                <Row className="pl-3">
                                    {isZBCVBCTemplate &&
                                        <Col md="12">
                                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && (fileName !== 'Interest Rate') && (fileName !== ASSEMBLYORCOMPONENTSRFQ) && (fileName !== RAWMATERIALSRFQ) && (fileName !== BOUGHTOUTPARTSRFQ) &&
                                                <Label sm={isMachineMoreTemplate || (fileName === 'Operation' && getConfigurationKey().IsShowDetailedOperationBreakup) ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
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
                                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && (fileName !== ASSEMBLYORCOMPONENTSRFQ) && (fileName !== RAWMATERIALSRFQ) && (fileName !== BOUGHTOUTPARTSRFQ) && <Label sm={isMachineMoreTemplate || (fileName === 'Operation' && getConfigurationKey().IsShowDetailedOperationBreakup) ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingTypeId === VBCTypeId ? true : fileName === 'Interest Rate' ? true : false}
                                                    onClick={() => this.onPressHeads(VBCTypeId)}
                                                />{' '}
                                                <span>{VendorLabel} Based
                                                </span>
                                            </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').cbc) && (fileName !== ASSEMBLYORCOMPONENTSRFQ) && (fileName !== RAWMATERIALSRFQ) && (fileName !== BOUGHTOUTPARTSRFQ) && <Label sm={isMachineMoreTemplate || (fileName === 'Operation' && getConfigurationKey().IsShowDetailedOperationBreakup) ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingTypeId === CBCTypeId ? true : false}
                                                    onClick={() => this.onPressHeads(CBCTypeId)}
                                                />{' '}
                                                <span>Customer Based</span>
                                            </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && (this.props?.masterId === BOP_MASTER_ID) && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={bopType === DETAILED_BOP ? true : false}
                                                    onClick={() => this.onPressHeads('', DETAILED_BOP)}
                                                />{' '}
                                                <span>VBC Detailed {showBopLabel()}</span>
                                            </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && isMachineMoreTemplate &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === ZBCADDMORE ? true : false}
                                                        onClick={() => this.onPressHeads(ZBCADDMORE)}
                                                    />{' '}
                                                    <span>ZBC More Details</span>
                                                </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && isMachineMoreTemplate &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === VBCADDMORE ? true : false}
                                                        onClick={() => this.onPressHeads(VBCADDMORE)}
                                                    />{' '}
                                                    <span>VBC More Details</span>
                                                </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').cbc) && isMachineMoreTemplate &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === CBCADDMORE ? true : false}
                                                        onClick={() => this.onPressHeads(CBCADDMORE)}
                                                    />{' '}
                                                    <span>CBC More Details</span>
                                                </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && (fileName === 'Operation' && getConfigurationKey().IsShowDetailedOperationBreakup) &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === ZBCADDMOREOPERATION ? true : false}
                                                        onClick={() => this.onPressHeads(ZBCADDMOREOPERATION)}
                                                    />{' '}
                                                    <span>ZBC More Details</span>
                                                </Label>}
                                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && (fileName === 'Operation' && getConfigurationKey().IsShowDetailedOperationBreakup) &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === VBCADDMOREOPERATION ? true : false}
                                                        onClick={() => this.onPressHeads(VBCADDMOREOPERATION)}
                                                    />{' '}
                                                    <span>VBC More Details</span>
                                                </Label>}
                                            {(fileName === 'Operation' && getConfigurationKey().IsShowDetailedOperationBreakup) && (reactLocalStorage.getObject('CostingTypePermission').cbc) &&
                                                <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                    <input
                                                        type="radio"
                                                        name="costingHead"
                                                        checked={costingTypeId === CBCADDMOREOPERATION ? true : false}
                                                        onClick={() => this.onPressHeads(CBCADDMOREOPERATION)}
                                                    />{' '}
                                                    <span>CBC More Details</span>
                                                </Label>
                                            }
                                        </Col>}

                                    <div className="input-group mt25 col-md-12 input-withouticon download-btn" >
                                        <Downloadxls
                                            isZBCVBCTemplate={isZBCVBCTemplate}
                                            isMachineMoreTemplate={isMachineMoreTemplate}
                                            fileName={fileName}
                                            isFailedFlag={false}
                                            costingTypeId={costingTypeId}
                                            bopType={bopType}
                                            isImport={this.state.isImport}
                                            selectedOption={selectedOption}
                                            modelText={modelText}
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

                                </Row >
                                <Row className=" justify-content-between">
                                    <div className="col-sm-12 text-right">
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
                                            disabled={(setDisable || noApprovalCycle) && (!this.props.initialConfiguration.IsMultipleUserAllowForApproval)}
                                        >
                                            <div className={"save-icon"}></div>
                                            {isEditFlag ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                    {noApprovalCycle && <WarningMessage dClass={"justify-content-end"} message={'This user is not in the approval cycle'} />}
                                </Row>
                            </form >
                        </div >
                    </Container >
                </Drawer > : <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <Row className="pl-3">
                        {isZBCVBCTemplate &&
                            <Col md="12">
                                {(reactLocalStorage.getObject('CostingTypePermission').zbc) && (fileName !== 'Interest Rate') && (fileName !== ASSEMBLYORCOMPONENTSRFQ) && (fileName !== RAWMATERIALSRFQ) && (fileName !== BOUGHTOUTPARTSRFQ) &&
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
                                {(reactLocalStorage.getObject('CostingTypePermission').vbc) && (fileName !== ASSEMBLYORCOMPONENTSRFQ) && (fileName !== RAWMATERIALSRFQ) && (fileName !== BOUGHTOUTPARTSRFQ) && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        checked={costingTypeId === VBCTypeId ? true : fileName === 'Interest Rate' ? true : false}
                                        onClick={() => this.onPressHeads(VBCTypeId)}
                                    />{' '}
                                    <span>{VendorLabel} Based</span>
                                </Label>}
                                {(reactLocalStorage.getObject('CostingTypePermission').cbc) && (fileName !== ASSEMBLYORCOMPONENTSRFQ) && (fileName !== RAWMATERIALSRFQ) && (fileName !== BOUGHTOUTPARTSRFQ) && <Label sm={isMachineMoreTemplate ? 6 : 4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        checked={costingTypeId === CBCTypeId ? true : false}
                                        onClick={() => this.onPressHeads(CBCTypeId)}
                                    />{' '}
                                    <span>Customer Based</span>
                                </Label>}
                                {(reactLocalStorage.getObject('CostingTypePermission').zbc) && isMachineMoreTemplate &&
                                    <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                        <input
                                            type="radio"
                                            name="costingHead"
                                            checked={costingTypeId === ZBCADDMORE ? true : false}
                                            onClick={() => this.onPressHeads(ZBCADDMORE)}
                                        />{' '}
                                        <span>ZBC More Details</span>
                                    </Label>}
                                {(reactLocalStorage.getObject('CostingTypePermission').vbc) && isMachineMoreTemplate &&
                                    <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                        <input
                                            type="radio"
                                            name="costingHead"
                                            checked={costingTypeId === VBCADDMORE ? true : false}
                                            onClick={() => this.onPressHeads(VBCADDMORE)}
                                        />{' '}
                                        <span>VBC More Details</span>
                                    </Label>
                                }
                                {
                                    isMachineMoreTemplate &&
                                    <Label sm={6} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                        <input
                                            type="radio"
                                            name="costingHead"
                                            checked={costingTypeId === CBCADDMORE ? true : false}
                                            onClick={() => this.onPressHeads(CBCADDMORE)}
                                        />{' '}
                                        <span>CBC More Details</span>
                                    </Label>
                                }
                            </Col >}

                        <div className="input-group mt25 col-md-12 input-withouticon download-btn" >
                            <Downloadxls
                                isZBCVBCTemplate={isZBCVBCTemplate}
                                isMachineMoreTemplate={isMachineMoreTemplate}
                                fileName={fileName}
                                isFailedFlag={false}
                                costingTypeId={costingTypeId}
                                selectedOption={selectedOption}
                                modelText={modelText}
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

                    </Row >
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
                                disabled={this.props.initialConfiguration.IsMultipleUserAllowForApproval ? false : setDisable}
                            >
                                <div className={"save-icon"}></div>
                                {isEditFlag ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </Row>
                </form >}
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
    const { rfq, auth, material } = state
    const { checkRFQPartBulkUpload } = rfq
    const { userMasterLevelAPI, initialConfiguration } = auth
    const { deptList } = material
    return { checkRFQPartBulkUpload, userMasterLevelAPI, initialConfiguration, deptList };
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
    volumeBulkUpload,
    bulkUploadInterestRateZBC,
    bulkUploadInterestRateVBC,
    bulkUploadInterestRateCBC,
    bulkUploadBudgetMaster,
    checkRFQBulkUpload,
    checkComponentOrAssemblyRFQBulkUpload,
    checkRawMaterialRFQBulkUpload,
    checkBoughtOutPartsRFQBulkUpload,
    getUsersMasterLevelAPI,
    checkFinalUser,
    bulkUploadIndex,
    bulkUploadCommodityInIndex,
    bulkUploadIndexData,
    bulkUploadStandardizedCommodity,
    bulkUploadCommodityStandard,
    getAllMasterApprovalDepartment,
    getAllDivisionListAssociatedWithDepartment,
    sapPushBulkUpload
})(reduxForm({
    form: 'BulkUpload',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
})(withTranslation('MasterLabels')(BulkUpload)));
