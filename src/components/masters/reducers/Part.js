import {
    API_REQUEST,
    GET_UOM_DATA_SUCCESS,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_ALL_PARTS_SUCCESS,
    GET_ALL_PARTS_FAILURE,
    GET_UNIT_PART_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_ALL_NEW_PARTS_SUCCESS,
    GET_PART_SELECTLIST_SUCCESS,
    GET_ASSEMBLY_PART_SELECTLIST,
    GET_COMPONENT_PART_SELECTLIST,
    GET_BOUGHTOUT_PART_SELECTLIST,
    GET_DRAWER_CHILD_PART_DATA,
    SET_ACTUAL_BOM_DATA,
    GET_PRODUCT_DATA_LIST,
    GET_PRODUCT_UNIT_DATA,
    GET_ALL_NEW_PARTS_SUCCESS_PAGINATION,
    PRODUCT_GROUPCODE_SELECTLIST,
    ADD_PRODUCT_HIERARCHY,
    ADD_PRODUCT_LABELS,
    GET_PRODUCT_HIERARCHY_DATA,
    GET_PRODUCT_HIERARCHY_LABELS,
    STORE_HIERARCHY_DATA,
    API_FAILURE,
    GET_PART_FAMILY_LIST_SUCCESS,
    GET_ALL_PART_FAMILY_LIST_SUCCESS,
    GET_PART_FAMILY_DETAILS_SUCCESS
} from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper';

const initialState = {
    productDataList: [],
    productHierarchyData: [],
    storedHierarachyData: []
};

export default function partReducer(state = initialState, action) {
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
        case CREATE_PART_REQUEST:
            return {
                ...state,
                loading: false
            };
        case GET_UOM_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                uniOfMeasurementList: action.payload
            };
        case GET_MATERIAL_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                materialTypeList: action.payload
            };

        case CREATE_PART_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_PART_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_ALL_PARTS_SUCCESS: {

            let arr = []
            arr = action.payload && action.payload.filter((el, i) => {                 //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: '2021-03-01T00:00:00' BUT WE WERE RECEIVING DATE IN 01/03/2021
                el.EffectiveDateNew = el.EffectiveDate                                 //  WHICH WAS CAUSING DATE FILTER TO NOT WORK PROPERLY IN AG GRID
                return true
            })
            return {
                ...state,
                partsListing: arr,
                loading: false,
                error: false
            };
        }
        case GET_PART_SELECTLIST_SUCCESS: {
            return {
                ...state,
                partSelectList: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_ALL_NEW_PARTS_SUCCESS: {

            let arrNew = []
            arrNew = action.payload && action.payload.filter((el, i) => {                 //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: 01/03/2021  BUT WE WERE RECEIVING DATE IN '2021-03-01T00:00:00'
                el.EffectiveDateNew = DayTime(el.EffectiveDate)                                //  WHICH WAS CAUSING DATE FILTER TO NOT WORK PROPERLY IN AG GRID FOR PAGINATION IN PART MASTER
                return true
            })

            return {
                ...state,
                newPartsListing: arrNew,
                loading: false,
                error: false
            };
        }
        case GET_ALL_NEW_PARTS_SUCCESS_PAGINATION: {

            let arrNew = []
            arrNew = action.payload && action.payload.filter((el, i) => {                 //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: 01/03/2021  BUT WE WERE RECEIVING DATE IN '2021-03-01T00:00:00'
                el.EffectiveDateNew = DayTime(el.EffectiveDate).format("DD/MM/YYYY")                                 //  WHICH WAS CAUSING DATE FILTER TO NOT WORK PROPERLY IN AG GRID FOR PAGINATION IN PART MASTER
                return true
            })

            return {
                ...state,
                allNewPartsListing: arrNew,
                loading: false,
                error: false
            };
        }
        case GET_UNIT_PART_DATA_SUCCESS: {
            return {
                ...state,
                partData: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_DRAWER_CHILD_PART_DATA: {
            return {
                ...state,
                DrawerPartData: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_ASSEMBLY_PART_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                assemblyPartSelectList: action.payload,
            };
        }
        case GET_COMPONENT_PART_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                componentPartSelectList: action.payload,
            };
        }
        case GET_BOUGHTOUT_PART_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                boughtOutPartSelectList: action.payload,
            };
        }
        case SET_ACTUAL_BOM_DATA: {
            return {
                ...state,
                loading: false,
                error: false,
                actualBOMTreeData: action.payload,
            };
        }
        case GET_ALL_PARTS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_PRODUCT_DATA_LIST:

            let temp = action.payload && action.payload.map((item) => {
                if (item.IsConsideredForMBOM === true) {
                    item.IsConsideredForMBOM = 'YES'
                } else {
                    item.IsConsideredForMBOM = 'NO'
                }
                return item
            })

            return {
                ...state,
                loading: false,
                error: true,
                productDataList: temp
            }
        case GET_PRODUCT_UNIT_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                productData: action.payload
            }
        case PRODUCT_GROUPCODE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                productGroupSelectList: action.payload
            }
        case GET_PRODUCT_HIERARCHY_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                productHierarchyData: action.payload
            }
        case STORE_HIERARCHY_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                storedHierarachyData: action.payload
            }
        case GET_PART_FAMILY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                partFamilyList: action.payload
            }   
        case GET_ALL_PART_FAMILY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                allPartFamilyList: action.payload
            }
        case GET_PART_FAMILY_DETAILS_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                partFamilyDetails: action.payload
            }
        default:
            return state;
    }
}
