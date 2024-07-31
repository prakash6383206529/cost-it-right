import { li } from 'react-dom-factories';
import {
    API_REQUEST, API_FAILURE, CREATE_MATERIAL_SUCCESS, CREATE_MATERIAL_FAILURE, GET_RM_LIST_SUCCESS, GET_RM_GRADE_LIST_SUCCESS,
    GET_GRADE_DATA_SUCCESS, GET_RM_CATEGORY_LIST_SUCCESS, GET_RM_SPECIFICATION_LIST_SUCCESS, GET_SPECIFICATION_DATA_SUCCESS, GET_MATERIAL_LIST_SUCCESS,
    GET_MATERIAL_LIST_TYPE_SUCCESS, RAWMATERIAL_ADDED_FOR_COSTING, GET_MATERIAL_TYPE_DATA_SUCCESS, GET_CATEGORY_DATA_SUCCESS, GET_RAW_MATERIAL_DATA_SUCCESS,
    GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS, GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS, GET_RM_TYPE_DATALIST_SUCCESS, GET_RMTYPE_SELECTLIST_SUCCESS,
    GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS, GET_RM_NAME_SELECTLIST, GET_GRADELIST_BY_RM_NAME_SELECTLIST, GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST,
    GET_GRADE_SELECTLIST_BY_RAWMATERIAL, GET_GRADE_SELECTLIST_SUCCESS, GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA, GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST,
    GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST, GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST, GET_VENDOR_FILTER_BY_GRADE_SELECTLIST, GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST,
    GET_GRADE_FILTER_BY_VENDOR_SELECTLIST, GET_MATERIAL_DATA_SELECTLIST_SUCCESS, GET_RM_DOMESTIC_LIST, GET_RM_IMPORT_LIST,
    GET_MANAGE_SPECIFICATION, GET_UNASSOCIATED_RM_NAME_SELECTLIST, SET_FILTERED_RM_DATA, GET_ALL_MASTER_APPROVAL_DEPARTMENT, GET_RM_APPROVAL_LIST, GET_ALL_RM_DOMESTIC_LIST, RAW_MATERIAL_DETAILS,
    COMMODITY_INDEX_RATE_AVERAGE,
    GET_RM_DETAILS
} from '../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';
import { tokenStatus, tokenStatusName } from '../../../config/masterData';

const initialState = {
    filterRMSelectList: {},
    viewRmDetails: []
};

export default function materialReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false
            };
        case CREATE_MATERIAL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_MATERIAL_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_RM_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialDetail: action.payload
            };
        case GET_RM_GRADE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialGradeDetail: action.payload
            };
        case GET_RM_CATEGORY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialCategoryDetail: action.payload
            };
        case GET_RM_SPECIFICATION_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmSpecificationDetail: action.payload
            };
        case GET_MATERIAL_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmDetail: action.payload
            };
        case GET_MATERIAL_LIST_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmTypeDetail: action.payload
            };
        case RAWMATERIAL_ADDED_FOR_COSTING:
            return {
                ...state,
                loading: false,
                error: true,
                selectedRawMaterialDetail: action.payload
            };
        case GET_MATERIAL_TYPE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                materialTypeData: action.payload
            };
        case GET_CATEGORY_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryData: action.payload
            };
        case GET_GRADE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                gradeData: action.payload
            };
        case GET_SPECIFICATION_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                specificationData: action.payload
            };
        case GET_RAW_MATERIAL_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialData: action.payload
            };
        case GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialDetails: action.payload
            };
        case GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialDetailsData: action.payload
            };
        case GET_RM_TYPE_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialTypeDataList: action.payload
            };
        case GET_RMTYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialTypeSelectList: action.payload
            };
        case GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                gradeByRMTypeSelectList: action.payload
            };
        case GET_RM_NAME_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialNameSelectList: action.payload
            };
        case GET_GRADELIST_BY_RM_NAME_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                gradeSelectListByRMID: action.payload
            };
        case GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                vendorListByVendorType: action.payload
            };
        // case GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS:
        //     return {
        //         ...state,
        //         loading: false,
        //         error: true,
        //         vendorListByVendorType: action.payload
        //     };
        case GET_GRADE_SELECTLIST_BY_RAWMATERIAL:
            return {
                ...state,
                loading: false,
                error: true,
                gradeSelectListByRMID: action.payload
            };
        case GET_GRADE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                gradeSelectList: action.payload
            };
        case GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: action.payload
            };
        case GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: { ...state.filterRMSelectList, Grades: action.payload }
            };
        case GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: { ...state.filterRMSelectList, Vendors: action.payload }
            };
        case GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: { ...state.filterRMSelectList, RawMaterials: action.payload }
            };
        case GET_VENDOR_FILTER_BY_GRADE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: { ...state.filterRMSelectList, Vendors: action.payload }
            };
        case GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: { ...state.filterRMSelectList, RawMaterials: action.payload }
            };
        case GET_GRADE_FILTER_BY_VENDOR_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterRMSelectList: { ...state.filterRMSelectList, Grades: action.payload }
            };
        case GET_MATERIAL_DATA_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                MaterialSelectList: action.payload
            };
        case GET_RM_DOMESTIC_LIST:
            let arr = [];
            arr = action.payload && action.payload.filter((item) => {
                item.BasicRate = checkForDecimalAndNull(item.BasicRate, getConfigurationKey()?.NoOfDecimalForPrice)
                item.ScrapRate = checkForDecimalAndNull(item.ScrapRate, getConfigurationKey()?.NoOfDecimalForPrice)
                item.RMShearingCost = checkForDecimalAndNull(item.RMShearingCost, getConfigurationKey()?.NoOfDecimalForPrice)
                item.RMFreightCost = checkForDecimalAndNull(item.RMFreightCost, getConfigurationKey()?.NoOfDecimalForPrice)
                item.NetLandedCost = checkForDecimalAndNull(item.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice)
                item.IsScrapUOMApply = item.IsScrapUOMApply === true ? 'Yes' : 'No'
                return item.IsAVCCosting === false
            }
            )
            return {
                ...state,
                loading: false,
                error: true,
                rmDataList: arr
            }
        case GET_ALL_RM_DOMESTIC_LIST:
            let arry = [];
            arry = action.payload && action.payload.filter((item) => {
                return item.IsAVCCosting === false
            }
            )
            return {
                ...state,
                loading: false,
                error: true,
                allRmDataList: arry
            }
        case GET_RM_IMPORT_LIST:
            let arr2 = [];
            arr2 = action.payload && action.payload.filter((item) => {
                item.BasicRate = checkForDecimalAndNull(item.BasicRate, getConfigurationKey()?.NoOfDecimalForPrice)
                item.ScrapRate = checkForDecimalAndNull(item.ScrapRate, getConfigurationKey()?.NoOfDecimalForPrice)
                item.RMShearingCost = checkForDecimalAndNull(item.RMShearingCost, getConfigurationKey()?.NoOfDecimalForPrice)
                item.RMFreightCost = checkForDecimalAndNull(item.RMFreightCost, getConfigurationKey()?.NoOfDecimalForPrice)
                item.NetLandedCost = checkForDecimalAndNull(item.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice)
                item.NetLandedCostConversion = checkForDecimalAndNull(item.NetLandedCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)
                item.IsScrapUOMApply = item.IsScrapUOMApply === true ? 'Yes' : 'No'
                return item.IsAVCCosting === false

            }
            )
            return {
                ...state,
                loading: false,
                error: true,
                rmImportDataList: arr2
            }
        case GET_MANAGE_SPECIFICATION:
            return {
                ...state,
                loading: false,
                error: true,
                rmSpecificationList: action.payload
            }
        // case GET_MANAGE_MATERIAL:
        //     return {
        //         ...state,
        //         loading: false,
        //         error: true,
        //         rmMaterialList: action.payload
        //     }
        case GET_UNASSOCIATED_RM_NAME_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                unassociatedMaterialList: action.payload
            }
        case SET_FILTERED_RM_DATA:
            return {
                ...state,
                loading: false,
                filteredRMData: action.payload
            }
        case GET_ALL_MASTER_APPROVAL_DEPARTMENT:
            //MINDA
            // const list = action.payload
            // const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
            // const updateList = list && list.filter(item => Departments.includes(item.Text))
            return {
                ...state,
                loading: false,
                deptList: action.payload
            }
        case GET_RM_APPROVAL_LIST:
            // let temp1 = []
            // let temp = action.payload
            // temp && temp.map((item) => {
            //     if (item.DepartmentName === userDetails().Department) {
            //         temp1.push(item)
            //     }
            // })

            let array = []
            if (action?.payload[0]?.Plant !== undefined) {
                array = action.payload && action.payload.filter((item) => {
                    return item.Plants = item.Plant
                })
            }

            if (action?.payload[0]?.OperationId !== undefined && action?.payload[0]?.OperationId !== null) {
                array = action.payload && action.payload.filter((item) => {
                    return (item.TechnologyName = item.Technology,
                        item.BasicRate = item.Rate

                    )
                })
            }

            if (action?.payload[0]?.MachineId !== undefined && action?.payload[0]?.MachineId !== null) {
                array = action.payload && action.payload.filter((item) => {
                    return (
                        item.BasicRate = item.MachineRate

                    )
                })
            }
            if (action?.payload[0]?.RawMaterialId !== undefined && action?.payload[0]?.RawMaterialId !== null) {
                array = action.payload && action.payload.map((item) => {
                    item.NetLandedCost = checkForDecimalAndNull(item.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.BasicRate = checkForDecimalAndNull(item.BasicRate, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.ScrapRate = checkForDecimalAndNull(item.ScrapRate, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.RMFreightCost = checkForDecimalAndNull(item.RMFreightCost, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.RMShearingCost = checkForDecimalAndNull(item.RMShearingCost, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.IsScrapUOMApply = item.IsScrapUOMApply === true ? 'Yes' : 'No'
                    return item

                })
            }
            else if (action?.payload[0]?.BoughtOutPartId !== undefined && action?.payload[0]?.BoughtOutPartId !== null) {
                array = action.payload && action.payload.filter((item) => {
                    item.NetLandedCost = checkForDecimalAndNull(item.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.BasicRate = checkForDecimalAndNull(item.BasicRate, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.IncoTermDescriptionAndInfoTerm = `${item.IncoTermDescription ? `${item.IncoTermDescription}` : ''} ${item.IncoTerm ? `(${item.IncoTerm})` : '-'}`
                    item.PaymentTermDescriptionAndPaymentTerm = `${item.PaymentTermDescription ? `${item.PaymentTermDescription}` : ''} ${item.PaymentTerm ? `(${item.PaymentTerm})` : '-'}`
                    item.NetCostWithoutConditionCost = checkForDecimalAndNull(item.NetCostWithoutConditionCost, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.NetConditionCost = checkForDecimalAndNull(item.NetConditionCost, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.BasicRateConversion = checkForDecimalAndNull(item.BasicRateConversion, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.NetCostWithoutConditionCostConversion = checkForDecimalAndNull(item.NetCostWithoutConditionCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.NetConditionCostConversion = checkForDecimalAndNull(item.NetConditionCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)
                    item.NetLandedCostConversion = checkForDecimalAndNull(item.NetLandedCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)
                    return item
                })
            }
            array = action.payload.map(item => {
                item.TooltipText = '';
                switch (item.Status) {
                    case tokenStatusName.AWAITING_FOR_APPROVAL:
                        item.TooltipText = tokenStatus.AwaitingForApproval;
                        break;
                    case tokenStatusName.PENDING_FOR_APPROVAL:
                        item.TooltipText = tokenStatus.PendingForApproval;
                        break;
                    case tokenStatusName.DRAFT:
                        item.TooltipText = tokenStatus.Draft;
                        break;
                    case tokenStatusName.APPROVED:
                        item.TooltipText = tokenStatus.Approved;
                        break;
                    case tokenStatusName.REJECTED:
                        item.TooltipText = tokenStatus.Rejected;
                        break;
                    case tokenStatusName.PUSHED:
                        item.TooltipText = tokenStatus.Pushed;
                        break;
                    case tokenStatusName.ERROR:
                        item.TooltipText = tokenStatus.Error;
                        break;
                    case tokenStatusName.HISTORY:
                        item.TooltipText = tokenStatus.History;
                        break;
                    case tokenStatusName.LINKED:
                        item.TooltipText = tokenStatus.Linked;
                        break;
                    case tokenStatusName.PROVISIONAL:
                        item.TooltipText = tokenStatus.Provisional;
                        break;

                    default:
                        break;
                }
                return item
            })
            if (array.length === 0) {
                array = action.payload
            }
            return {
                ...state,
                loading: false,
                approvalList: array
            }
        case RAW_MATERIAL_DETAILS:
            return {
                ...state,
                loading: false,
                rawMaterailDetails: action.payload
            }
        case GET_RM_DETAILS:
            return {
                ...state,
                loading: false,
                viewRmDetails: action.payload
            }
        case COMMODITY_INDEX_RATE_AVERAGE:
            return {
                ...state,
                loading: false,
                commodityAverage: action.payload
            }
        default:
            return state;
    }
}
