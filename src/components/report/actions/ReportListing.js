import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_REPORT_LIST, config, EMPTY_GUID
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';

const headers = config

// export function getReportListing(data, callback) {
//     return (dispatch) => {
//         dispatch({ type: API_REQUEST });
//         const queryParameter = `logged_in_user_id=${data.loggedUser}&logged_in_user_level_id=${data.logged_in_user_level_id}&part_number=${data.partNo}&created_by=${data.createdBy}&requested_by=${data.requestedBy}&status=${data.status}&type_of_costing=''`
//         const request = axios.get(`${API.getReportListing}/${queryParameter}`, headers)
//         
//         request.then((response) => {
//             alert(response.data);
//             
//             if (response.data.Result || response.status === 204) {
//                 //
//                 dispatch({
//                     type: GET_REPORT_LIST,
//                     payload: response.status === 204 ? [] : response.data.DataList
//                 })
//                 callback(response);
//             }
//         }).catch((error) => {
//             dispatch({ type: API_FAILURE, });
//             apiErrors(error);
//         });
//       }
// }

/**
 * @method getRMImportDataList
 * @description Used to get RM Import Datalist
 */
export function getReportListing(index, take, isPagination, data, callback) {

    return (dispatch) => {
        if (isPagination === true) {
            const queryParams = `costingNumber=${data.costingNumber}&toDate=${data.toDate}&fromDate=${data.fromDate}&statusId=${data.statusId}&technologyId=${data.technologyId}&plantCode=${data.plantCode}&vendorCode=${data.vendorCode}&userId=${EMPTY_GUID}&isSortByOrderAsc=${data.isSortByOrderAsc}`

            const queryParamsSecond = `&isApplyPagination=${true}&skip=${index}&take=${take}`

            const request = axios.get(`${API.getReportListing}?${queryParams}${queryParamsSecond}`, headers);
            request.then((response) => {
                if (response.data.Result || response.status === 204) {
                    dispatch({
                        type: GET_REPORT_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    callback(response);

                }

            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                //apiErrors(error);
            });
        } else {
            dispatch({

                type: GET_REPORT_LIST,

                payload: []

            })

            callback([]);
        }
    };


}

/**
 * @method getCostingReport
 * @description Used to get Costing Report
 */
export function getCostingReport(skip, take, isPagination, obj, isLastWeek, callback) {

    return (dispatch) => {
        if (isPagination === true) {

            const queryParams = `applyPagination=${isPagination}&skip=${skip}&take=${take}`
            const queryParamsSecond = `CostingNumber=${obj.CostingNumber ?? obj.CostingNumber}&Technology=${obj.TechnologyName ?? obj.TechnologyName}&AmorizationQuantity=${obj.AmorizationQuantity ?? obj.AmorizationQuantity}&AnyOtherCost=${obj.AnyOtherCost ?? obj.AnyOtherCost}&CostingVersion=${obj.CostingVersion ?? obj.CostingVersion}&Status=${obj.Status ?? obj.DisplayStatus}&EffectiveDate=${obj.EffectiveDate ?? obj.EffectiveDate}&Currency=${obj.Currency ?? obj.Currency}&DepartmentCode=${obj.DepartmentCode ?? obj.DepartmentCode}&DepartmentName=${obj.DepartmentName ?? obj.DepartmentName}&DiscountCost=${obj.DiscountCost}&ECNNumber=${obj.ECNNumber ?? obj.ECNNumber}&FinalPOPrice=${obj.FinalPOPrice ?? obj.FinalPOPrice}&RawMaterialFinishWeight=${obj.RawMaterialFinishWeight ?? obj.RawMaterialFinishWeight}&FreightCost=${obj.FreightCost ?? obj.FreightCost}&FreightPercentage=${obj.FreightPercentage ?? obj.FreightPercentage}&FreightType=${obj.FreightType ?? obj.FreightType}&GrossWeight=${obj.GrossWeight ?? obj.GrossWeight}&HundiOrDiscountValue=${obj.HundiOrDiscountValue ?? obj.HundiOrDiscountValue}&ICCApplicability=${obj.ICCApplicability ?? obj.ICCApplicability}&ICCCost=${obj.ICCCost ?? obj.ICCCost}&ICCInterestRate=${obj.ICCInterestRate ?? obj.ICCInterestRate}&ICCOn=${obj.ICCOn ?? obj.ICCOn}&MasterBatchTotal=${obj.MasterBatchTotal ?? obj.MasterBatchTotal}&ModelType=${obj.ModelTypeForOverheadAndProfit ?? obj.ModelTypeForOverheadAndProfit}&ModifiedByName=${obj.ModifiedByName ?? obj.ModifiedByName}&ModifiedByUserName=${obj.ModifiedByUserName ?? obj.ModifiedByUserName}&ModifiedDate=${obj.ModifiedDate ?? obj.ModifiedDate}&NetBoughtOutPartCost=${obj.NetBoughtOutPartCost ?? obj.NetBoughtOutPartCost}&NetConversionCost=${obj.NetConversionCost ?? obj.NetConversionCost}&NetConvertedPOPrice=${obj.NetConvertedPOPrice ?? obj.NetConvertedPOPrice}&NetDiscountsCost=${obj.NetDiscountsCost ?? obj.NetDiscountsCost}&NetFreightPackaging=${obj.NetFreightPackaging ?? obj.NetFreightPackaging}&NetFreightPackagingCost=${obj.NetFreightPackagingCost ?? obj.NetFreightPackagingCost}&NetICCCost=${obj.NetICCCost ?? obj.NetICCCost}&NetOperationCost=${obj.NetOperationCost ?? obj.NetOperationCost}&NetOtherCost=${obj.NetOtherCost ?? obj.NetOtherCost}&NetOverheadAndProfitCost=${obj.NetOverheadAndProfitCost ?? obj.NetOverheadAndProfitCost}&NetPOPrice=${obj.NetPOPrice ?? obj.NetPOPrice}&NetPOPriceINR=${obj.NetPOPriceINR ?? obj.NetPOPriceINR}&NetPOPriceInCurrency=${obj.NetPOPriceInCurrency ?? obj.NetPOPriceInCurrency}&NetPOPriceOtherCurrency=${obj.NetPOPriceOtherCurrency ?? obj.NetPOPriceOtherCurrency}&NetProcessCost=${obj.NetProcessCost ?? obj.NetProcessCost}&NetRawMaterialsCost=${obj.NetRawMaterialsCost ?? obj.NetRawMaterialsCost}&NetSurfaceTreatmentCost=${obj.NetSurfaceTreatmentCost ?? obj.NetSurfaceTreatmentCost}&NetToolCost=${obj.NetToolCost ?? obj.NetToolCost}&NetTotalRMBOPCC=${obj.NetTotalRMBOPCC ?? obj.NetTotalRMBOPCC}&OtherCost=${obj.OtherCost ?? obj.OtherCost}&OtherCostPercentage=${obj.OtherCostPercentage ?? obj.OtherCostPercentage}&OverheadApplicability=${obj.OverheadApplicability ?? obj.OverheadApplicability}&OverheadCombinedCost=${obj.OverheadCombinedCost ?? obj.OverheadCombinedCost}&OverheadCost=${obj.OverheadCost ?? obj.OverheadCost}&OverheadOn=${obj.OverheadOn ?? obj.OverheadOn}&OverheadPercentage=${obj.OverheadPercentage ?? obj.OverheadPercentage}&PackagingCost=${obj.PackagingCost ?? obj.PackagingCost}&PackagingCostPercentage=${obj.PackagingCostPercentage ?? obj.PackagingCostPercentage}&PartName=${obj.PartName ?? obj.PartName}&PartNumber=${obj.PartNumber ?? obj.PartNumber}&PartType=${obj.PartType ?? obj.PartType}&PaymentTermCost=${obj.PaymentTermCost ?? obj.PaymentTermCost}&PaymentTermsOn=${obj.PaymentTermsOn ?? obj.PaymentTermsOn}&PlantCode=${obj.PlantCode ?? obj.PlantCode}&PlantName=${obj.PlantName ?? obj.PlantName}&ProfitApplicability=${obj.ProfitApplicability ?? obj.ProfitApplicability}&ProfitCost=${obj.ProfitCost ?? obj.ProfitCost}&ProfitOn=${obj.ProfitOn ?? obj.ProfitOn}&ProfitPercentage=${obj.ProfitPercentage ?? obj.ProfitPercentage}&RMGrade=${obj.RMGrade ?? obj.RMGrade}&RMSpecification=${obj.RMSpecification ?? obj.RMSpecification}&RawMaterialCode=${obj.RawMaterialCode ?? obj.RawMaterialCode}&RawMaterialGrossWeight=${obj.RawMaterialGrossWeight ?? obj.RawMaterialGrossWeight}&RawMaterialName=${obj.RawMaterialName ?? obj.RawMaterialName}&RawMaterialRate=${obj.RawMaterialRate ?? obj.RawMaterialRate}&RawMaterialScrapWeight=${obj.RawMaterialScrapWeight ?? obj.RawMaterialScrapWeight}&RawMaterialSpecification=${obj.RawMaterialSpecification ?? obj.RawMaterialSpecification}&RecordInsertedBy=${obj.RecordInsertedBy ?? obj.RecordInsertedBy}&RejectOn=${obj.RejectOn ?? obj.RejectOn}&RejectionApplicability=${obj.RejectionApplicability ?? obj.RejectionApplicability}&RejectionCost=${obj.RejectionCost ?? obj.RejectionCost}&RejectionPercentage=${obj.RejectionPercentage ?? obj.RejectionPercentage}&Remark=${obj.Remark ?? obj.Remark}&Rev=${obj.Rev ?? obj.Rev}&RevisionNumber=${obj.RevisionNumber ?? obj.RevisionNumber}&ScrapRate=${obj.ScrapRate ?? obj.ScrapRate}&ScrapWeight=${obj.ScrapWeight ?? obj.ScrapWeight}&SurfaceTreatmentCost=${obj.SurfaceTreatmentCost ?? obj.SurfaceTreatmentCost}&ToolCost=${obj.ToolCost ?? obj.ToolCost}&ToolLife=${obj.ToolLife ?? obj.ToolLife}&ToolMaintenanceCost=${obj.ToolMaintenaceCost ?? obj.ToolMaintenaceCost}&ToolPrice=${obj.ToolPrice ?? obj.ToolPrice}&ToolQuantity=${obj.ToolQuantity ?? obj.ToolQuantity}&TotalCost=${obj.TotalCost ?? obj.TotalCost}&TotalOtherCost=${obj.TotalOtherCost ?? obj.TotalOtherCost}&TotalRecordCount=${obj.TotalRecordCount ?? obj.TotalRecordCount}&TransportationCost=${obj.TransportationCost ?? obj.TransportationCost}&VendorCode=${obj.VendorCode ?? obj.VendorCode}&VendorName=${obj.VendorName ?? obj.VendorName}&Version=${obj.Version ?? obj.Version}&RawMaterialGrade=${obj.RawMaterialGrade ?? obj.RawMaterialGrade}&HundiOrDiscountPercentage=${obj.HundiOrDiscountPercentage ?? obj.HundiOrDiscountPercentage}&DateWiseData=${isLastWeek}&FromDate=${obj.FromDate ?? obj.FromDate}&ToDate=${obj.ToDate ?? obj.ToDate}`
            const request = axios.get(`${API.getCostingReport}?${queryParams}&${queryParamsSecond} `, headers);
            request.then((response) => {
                dispatch({
                    type: GET_REPORT_LIST,
                    payload: response.status === 204 || response.data.Result === false ? [] : response.data.DataList
                })
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                //apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_REPORT_LIST,
                payload: []
            })
            callback([]);
        }
    };
}