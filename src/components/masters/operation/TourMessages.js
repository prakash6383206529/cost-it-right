import { reactLocalStorage } from "reactjs-localstorage";

export function Steps(t, config) {
    return {
        ADD_OPERATION: [
            {
                element: "#Add_operation_zero_based",
                intro: t("operationMaster.Add_operation_zero_based"),
            },
            {
                element: "#Add_operation_vendor_based",
                intro: t("operationMaster.Add_operation_vendor_based"),
            },
            ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                element: "#Add_operation_customer_based",
                intro: t("operationMaster.Add_operation_customer_based"),
            }] : []),

            {
                element: "#AddOperation_operationType_container",
                intro: t("operationMaster.AddOperation_operationType_container"),
            },
            {
                element: "#AddOperation_technology_container",
                intro: t("operationMaster.AddOperation_technology_container"),
            },
            {
                element: "#AddOperation_OperationName",
                intro: t("operationMaster.AddOperation_OperationName"),
            },
            {
                element: "#AddOperation_OperationCode",
                intro: t("operationMaster.AddOperation_OperationCode"),
            },
            {
                element: "#AddOperation_Description",
                intro: t("operationMaster.AddOperation_Description"),
            },
            ...(config && config.vendorField ? [{

                element: "#AddOperation_VendorCode",
                intro: t("operationMaster.AddOperation_VendorCode"),
            },] : []),
            ...(config && config.vendorField ? [{

                element: "#AddOperation_AddVendorCode",
                intro: t("operationMaster.AddVendorCode"),
            },] : []),

            ...(config && config.destinationPlant ? [{

                element: "#AddOperation_DestinationPlant_container",
                intro: t("operationMaster.AddOperation_DestinationPlant_container"),
            },] : []),
            ...(config && config.plantField ? [{
                element: "#AddOperation_DestinationPlant_container",
                intro: t("operationMaster.AddOperation_Customer_container"),
            },] : []),

            ...(config && config.customerField ? [{
                element: "#AddOperation_clientName_container",
                intro: t("operationMaster.AddOperation_Plant_container"),
            },] : []),
            {
                element: "#AddOperation_UnitOfMeasurementId_container",
                intro: t("operationMaster.AddOperation_UnitOfMeasurementId_container"),
            },
            {
                element: "#AddOperation_Rate",
                intro: t("operationMaster.AddOperation_Rate"),
            },
            {
                element: "#AddOperation_LabourRatePerUOM",
                intro: t("operationMaster.AddOperation_LabourRatePerUOM"),
            },

            {
                element: "#AddOperation_EffectiveDate",
                intro: t("operationMaster.AddOperation_EffectiveDate"),
            },

            {
                element: "#AddOperation_SurfaceTreatmentCheckbox",
                intro: t("operationMaster.AddOperation_SurfaceTreatmentCheckbox"),
            },

            {
                element: "#AddMoreOperation_container",
                intro: t("operationMaster.AddMoreOperation_container"),
            },
            {
                element: "#AddOperation_Remark",
                intro: t("operationMaster.AddOperation_Remark"),
            },
            {
                element: "#AddOperation_UploadFiles",
                intro: t("operationMaster.AddOperation_UploadFiles"),
            },
            {
                element: "#AddOperation_Cancel",
                intro: t("operationMaster.AddOperation_Cancel"),
            },
            {
                element: "#AddOperation_SendForApproval",
                intro: t("operationMaster.AddOperation_SendForApproval"),
                position: 'left'
            },
        ],
    }
}