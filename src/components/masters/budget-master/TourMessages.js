// tourmessages.js

export function Steps(t, config) {
    return {
        ADD_BUDGET: [
            {
                element: "#AddBudget_ZeroBased",
                intro: t("budgetMater.AddBudget_ZeroBased"),
            },
            {
                element: "#AddBudget_VendorBased",
                intro: t("budgetMater.AddBudget_VendorBased"),
            },
            {
                element: "#AddBudget_CustomerBased",
                intro: t("budgetMater.AddBudget_CustomerBased"),
            },

            ...(config && config.vendorField ? [{
                element: "#AddBudget_vendorName",
                intro: t("budgetMater.AddBudget_Vendor_container"),
            },] : []),
            ...(config && config.plantField ? [{
                element: ".input-container #Plant_container",
                intro: t("budgetMater.AddBudget_PlantCode"),
            },] : []),
            ...(config && config.destinationPlant ? [{
                element: ".input-container #DestinationPlant_container",
                intro: t("budgetMater.AddBudget_PlantCode"),
            },] : []),
            {
                element: ".input-container #PartType_container",
                intro: t("budgetMater.AddBudget_PartType"),
            },
            {
                element: "#AddBudget_PartNumber",
                intro: t("budgetMater.AddBudget_PartNumber"),
            },
            {
                element: ".input-container #FinancialYear_container",
                intro: t("budgetMater.AddBudget_Year"),
            },
            {
                element: ".input-container #currency_container",
                intro: t("budgetMater.AddBudget_Currency"),
            },

            {
                element: "#AddBudget_checkbox",
                intro: t("budgetMater.AddBudget_checkbox"),
            },
            {
                element: "#currentPrice_container",
                intro: t("budgetMater.AddBudget_CurrentPrice"),
            },
            {
                element: "#AddBudget_Add",
                intro: t("budgetMater.AddBudget_Add"),
            },
            {
                element: "#AddBudget_Cancel",
                intro: t("budgetMater.AddBudget_Cancel"),
            },
            {
                element: "#AddBudget_Save",
                intro: t("budgetMater.AddBudget_Save"),
            },
        ],
    };
}
