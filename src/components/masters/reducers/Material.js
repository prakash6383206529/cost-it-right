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
    GET_MANAGE_SPECIFICATION, GET_UNASSOCIATED_RM_NAME_SELECTLIST, SET_FILTERED_RM_DATA, GET_ALL_MASTER_APPROVAL_DEPARTMENT, GET_RM_APPROVAL_LIST
} from '../../../config/constants';
import { userDetails } from '../../../helper';

const initialState = {
    filterRMSelectList: {}
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
            return {
                ...state,
                loading: false,
                error: true,
                rmDataList: action.payload
            }
        case GET_RM_IMPORT_LIST:
            return {
                ...state,
                loading: false,
                error: true,
                rmImportDataList: action.payload
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
            const list = action.payload
            const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
            const updateList = list && list.filter(item => Departments.includes(item.Text))

            return {
                ...state,
                loading: false,
                deptList: updateList
            }
        case GET_RM_APPROVAL_LIST:

            return {
                ...state,
                loading: false,
                approvalList: action.payload
            }
        default:
            return state;
    }
}
