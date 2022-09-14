import {
    API_REQUEST, GET_REPORT_LIST, GET_ALL_REPORT_LIST,
} from '../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';

const initialState = {
    reportListing: [],
    allReportListing: []
};

export default function ReportListingReducers(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_REPORT_LIST:
            let arr = []
            arr = action.payload && action.payload.filter((el) => {                 //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: '2021-03-01T00:00:00' BUT WE WERE RECEIVING DATE IN 01/03/2021
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
                return el
            })
            return {
                ...state,
                loading: false,
                reportListing: arr
            }
        case GET_ALL_REPORT_LIST:
            return {
                ...state,
                loading: false,
                allReportListing: action.payload
            }

        default:
            return state;
    }
}