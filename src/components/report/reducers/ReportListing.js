// import {
//     API_REQUEST, CREATED_BY_ASSEMBLY, GET_REPORT_LIST,
// } from '../../../config/constants';
// import { userDetails } from '../../../helper';

// const initialState = {
//     reportListing: []
// };

// export default function ReportListingReducers(state = initialState, action) {
//     switch (action.type) {
//         case API_REQUEST:
//             return {
//                 ...state,
//                 loading: true
//             };
//         case GET_REPORT_LIST:
//             let temp = action.payload
//             let Arr = []
//             let sr = 0
//             temp && temp.map(item => {
//                 if (item.Status === CREATED_BY_ASSEMBLY) {
//                     return false
//                 } else {
//                     item.PersonRequestingChange = userDetails().Name
//                     sr = ''
//                     item.SrNo = sr
//                     Arr.push(item)
//                     return Arr
//                 }
//             })
//             return {
//                 ...state,
//                 loading: false,
//                 reportListing: Arr
//             }

//         default:
//             return state;
//     }
// }



import {
    API_REQUEST, GET_REPORT_LIST, GET_ALL_REPORT_LIST, GET_BENCHMARK_MASTER_LIST, GET_COST_RATIO_REPORT, GET_REPORT_FORM_GRID_DATA, GET_PRODUCT_LIST, GET_PRODUCT_PART_DATA_LIST, GET_STAGE_OF_PART_DETAILS, GET_NFR_INSIGHT_DETAILS, GET_NFR_INSIGHT_STATUS_DETAILS,
    GET_COST_DEVIATION_REPORT, GET_BUSINESS_VALUE_REPORT_HEADS, GET_BUSINESS_VALUE_REPORT_DATA
} from '../../../config/constants';
import { userDetails } from '../../../helper';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';

const initialState = {
    reportListing: [],
    allReportListing: [],
    costReportFormGridData: {},
    stageOfPartDetails: [],
    productList: [],
    productPartDataList: [],
    nfrInsightDetails: [],
    nfrInsightStatusDetails: [],
    costDeviationReportList: []
};

export default function ReportListingReducers(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_REPORT_LIST:
            // WILL BE REMOVED AFTER TESTING
            // let temp = action.payload
            // let Arr = []
            // let sr = 0
            // let arr1 = []
            // temp && temp.map(item => {
            //     item.PersonRequestingChange = userDetails().Name
            //     sr = ''
            //     item.SrNo = sr
            //     Arr.push(item)
            //     return Arr

            // })

            // arr1 = Arr
            // return {
            //     ...state,
            //     loading: false,
            //     reportListing: arr1
            let arr = []
            let sr = 0
            arr = action.payload && action.payload.filter((el) => {
                sr = ''             //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: '2021-03-01T00:00:00' BUT WE WERE RECEIVING DATE IN 01/03/2021
                el.EffectiveDateNew = el.EffectiveDate
                el.RawMaterialScrapWeight = checkForDecimalAndNull(el.RawMaterialScrapWeight, getConfigurationKey()?.NoOfDecimalForInputOutput)
                el.RawMaterialGrossWeight = checkForDecimalAndNull(el.RawMaterialGrossWeight, getConfigurationKey()?.NoOfDecimalForInputOutput)
                el.RawMaterialFinishWeight = checkForDecimalAndNull(el.RawMaterialFinishWeight, getConfigurationKey()?.NoOfDecimalForInputOutput)
                el.NetRawMaterialsCost = checkForDecimalAndNull(el.NetRawMaterialsCost, getConfigurationKey()?.NoOfDecimalForInputOutput)
                el.NetBoughtOutPartCost = checkForDecimalAndNull(el.NetBoughtOutPartCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetProcessCost = checkForDecimalAndNull(el.NetProcessCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetOperationCost = checkForDecimalAndNull(el.NetOperationCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.SurfaceTreatmentCost = checkForDecimalAndNull(el.SurfaceTreatmentCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.TransportationCost = checkForDecimalAndNull(el.TransportationCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetSurfaceTreatmentCost = checkForDecimalAndNull(el.NetSurfaceTreatmentCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.OverheadCombinedCost = checkForDecimalAndNull(el.OverheadCombinedCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.ProfitCost = checkForDecimalAndNull(el.ProfitCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetOverheadAndProfitCost = checkForDecimalAndNull(el.NetOverheadAndProfitCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.RejectionCost = checkForDecimalAndNull(el.RejectionCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.ICCInterestRate = checkForDecimalAndNull(el.ICCInterestRate, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetICCCost = checkForDecimalAndNull(el.NetICCCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.PaymentTermCost = checkForDecimalAndNull(el.PaymentTermCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.PackagingCost = checkForDecimalAndNull(el.PackagingCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.FreightCost = checkForDecimalAndNull(el.FreightCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.ToolCost = checkForDecimalAndNull(el.ToolCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.ToolMaintenanceCost = checkForDecimalAndNull(el.ToolMaintenanceCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetToolCost = checkForDecimalAndNull(el.NetToolCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.HundiOrDiscountValue = checkForDecimalAndNull(el.HundiOrDiscountValue, getConfigurationKey()?.NoOfDecimalForPrice)
                el.AnyOtherCost = checkForDecimalAndNull(el.AnyOtherCost, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetPOPriceOtherCurrency = checkForDecimalAndNull(el.NetPOPriceOtherCurrency, getConfigurationKey()?.NoOfDecimalForPrice)
                el.NetPOPriceINR = checkForDecimalAndNull(el.NetPOPriceINR, getConfigurationKey()?.NoOfDecimalForPrice)
                el.PersonRequestingChange = userDetails().Name
                el.SrNo = sr
                return el
            })
            return {
                ...state,
                loading: false,
                reportListing: arr
            }
        case GET_ALL_REPORT_LIST:

            let tempAll = action.payload
            let ArrNew = []
            let srSecond = 0
            let arrSecond = []
            tempAll && tempAll.map(item => {
                item.PersonRequestingChange = userDetails().Name
                srSecond = ''
                item.SrNo = srSecond
                ArrNew.push(item)
                return ArrNew

            })

            arrSecond = ArrNew
            return {
                ...state,
                loading: false,
                allReportListing: arrSecond
            }

        case GET_BENCHMARK_MASTER_LIST:
            return {
                ...state,
                loading: false,
                BenchmarkList: action.payload

            }
        case GET_COST_RATIO_REPORT:
            return {
                ...state,
                loading: false,
                costRatioReportList: action.payload
            }
        case GET_REPORT_FORM_GRID_DATA:
            return {
                ...state,
                loading: false,
                costReportFormGridData: action.payload
            }
        case GET_PRODUCT_LIST:
            return {
                ...state,
                loading: false,
                productList: action.payload
            }
        case GET_PRODUCT_PART_DATA_LIST:
            return {
                ...state,
                loading: false,
                productPartDataList: action.payload
            }
        case GET_STAGE_OF_PART_DETAILS:
            return {
                ...state,
                loading: false,
                stageOfPartDetails: action.payload
            }
        case GET_NFR_INSIGHT_DETAILS:
            return {
                ...state,
                loading: false,
                nfrInsightDetails: action.payload
            }
        case GET_NFR_INSIGHT_STATUS_DETAILS:
            return {
                ...state,
                loading: false,
                nfrInsightStatusDetails: action.payload
            }
        case GET_COST_DEVIATION_REPORT:
            return {
                ...state,
                loading: false,
                costDeviationReportList: action.payload
            }
        case GET_BUSINESS_VALUE_REPORT_HEADS:
            return {
                ...state,
                loading: false,
                businessValueReportHeads: action.payload
            }
        case GET_BUSINESS_VALUE_REPORT_DATA:
            return {
                ...state,
                loading: false,
                businessValueReportData: action.payload
            }


        default:
            return state;
    }
}
