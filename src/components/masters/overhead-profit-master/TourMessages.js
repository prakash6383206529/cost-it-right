import { showBopLabel } from "../../../helper";

import { reactLocalStorage } from "reactjs-localstorage";

export function Steps(t, config) {
    const introWithBOPDynamicValue = (intro) => intro.replace(/bop|BOP/gi, showBopLabel());
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");
    const OverheadPercentage = (config && config.isEditFlag === false) ? t("overheadsdMaster.AddOverhead_OverheadPercentage") : t("overheadsdMaster.AddOverhead_EditOverheadPercentage");
    const OverheadRMPercentage = (config && config.isEditFlag === false) ? t("overheadsdMaster.AddOverhead_OverheadRMPercentage") : t("overheadsdMaster.AddOverhead_EditOverheadRMPercentage");
    const OverheadMachiningCCPercentage = (config && config.isEditFlag === false) ? t("overheadsdMaster.AddOverhead_OverheadMachiningCCPercentage") : t("overheadsdMaster.AddOverhead_EditOverheadMachiningCCPercentage");
    const OverheadBOPPercentage = (config && config.isEditFlag === false) ? introWithBOPDynamicValue(t("overheadsdMaster.AddOverhead_OverheadBOPPercentage")) : introWithBOPDynamicValue(t("overheadsdMaster.AddOverhead_EditOverheadBOPPercentage"));
    const EffectiveDate = (config && config.isEditFlag === false) ? t("overheadsdMaster.AddOverhead_EffectiveDate") : t("overheadsdMaster.AddOverhead_Edit_EffectiveDate");

    return {
        ADD_OVERHEADS_DETAILS: [
            ...(config && config.isEditFlag === false) ? [
                {
                    element: "#AddOverhead_zerobased",
                    intro: t("overheadsdMaster.AddOverhead_zerobased"),
                },
                {
                    element: "#AddOverhead_vendorbased",
                    intro: t("overheadsdMaster.AddOverhead_vendorbased"),
                },
                ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                    element: "#AddOverhead_customerbased",
                    intro: t("overheadsdMaster.AddOverhead_customerbased"),
                }] : []),
            ] : [],
            {
                element: "#AddOverhead_ModelType_container",
                intro: t("overheadsdMaster.AddOverhead_ModelType_container"),
            },
            ...(config && config.isEditFlag === false) ? [
                ...(config && config.vendorField ? [{
                    element: "#AddOverhead_vendorName",
                    intro: t("overheadsdMaster.AddOverhead_Vendor_container"),
                },] : []),
                ...(config && config.plantField ? [{
                    element: "#AddOverhead_Plant_container",
                    intro: t("overheadsdMaster.AddOverhead_Plant_container"),
                },] : []),

                ...(config && config.destinationPlant ? [{
                    element: "#AddOverhead_DestinationPlant_container",
                    intro: t("overheadsdMaster.AddOverhead_Plant_container"),
                },] : []),
                ...(config && config.customerField ? [{
                    element: "#AddOverhead_clientName_container",
                    intro: t("overheadsdMaster.AddOverhead_clientName_container"),
                }] : []),
            ] : [],
            {
                element: "#AddOverhead_ApplyPartCheckbox",
                intro: t("overheadsdMaster.AddOverhead_ApplyPartCheckbox"),
            },
            {
                element: "#AddOverhead_OverheadApplicability_container",
                intro: t("overheadsdMaster.AddOverhead_OverheadApplicability_container"),
            },
            ...(config && !(config.isHideOverhead) ? [
                ...config && !config.isOverheadPercent ? [
                    {
                        element: "#AddOverhead_OverheadPercentage",
                        intro: OverheadPercentage,
                    }] : [],
            ] : []),

            ...(config && config.isEditFlag === true) ? [
                ...(!config.isHideRM) ? [
                    ...config && !config.isRM ? [
                        {
                            element: "#AddOverhead_OverheadRMPercentage",
                            intro: OverheadRMPercentage,
                        }] : []
                ] : [],
                ...(!config.isHideCC) ? [
                    ...config && !config.isCC ? [
                        {
                            element: "#AddOverhead_OverheadMachiningCCPercentage",
                            intro: OverheadMachiningCCPercentage,
                        }] : []
                ] : [],
                ...(!config.isHideBOP) ? [
                    ...config && !config.isBOP ? [
                        {
                            element: "#AddOverhead_OverheadBOPPercentage",
                            intro: OverheadBOPPercentage,
                        }] : []
                ] : [],
            ] : [],
            {
                element: "#AddOverhead_EffectiveDate",
                intro: EffectiveDate,
            },
            {
                element: "#AddOverhead_Remark",
                intro: t("overheadsdMaster.AddOverhead_Remark"),
            },
            {
                element: "#AddOverhead_UploadFiles",
                intro: t("overheadsdMaster.AddOverhead_UploadFiles"),
            },
            {
                element: "#AddOverhead_Cancel",
                intro: t("overheadsdMaster.AddOverhead_Cancel"),
            },
            {
                element: "#AddOverhead_Save",
                intro: introMessage,
                position: 'left'
            },
        ],
        ADD_PROFIT_DETAILS: [
            {
                element: "#AddProfit_zeroBased",
                intro: t("overheadsProfits.AddProfit_zeroBased"),
            },
            {
                element: "#AddProfit_vendorBased",
                intro: t("overheadsProfits.AddProfit_vendorBased"),
            },
            ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                element: "#AddProfit_customerBased",
                intro: t("overheadsProfits.AddProfit_customerBased"),
            }] : []),
            {
                element: "#AddProfit_ModelType_container",
                intro: t("overheadsProfits.AddProfit_ModelType_container"),
            },
            ...(config && config.vendorField ? [{
                element: "#addProfit_vendorContainer",
                intro: t("overheadsProfits.addProfit_vendorContainer"),
            },] : []),
            ...(config && config.plantField ? [{
                element: "#AddProfit_Plant_container",
                intro: t("overheadsProfits.AddProfit_Plant_container"),
            },] : []),
            ...(config && config.destinationPlant ? [{
                element: "#AddProfit_DestinationPlant_container",
                intro: t("overheadsProfits.AddProfit_Plant_container"),
            },] : []),
            ...(config && config.customerField ? [{
                element: "#AddProfit_clientName_container",
                intro: t("overheadsProfits.AddProfit_clientName_container"),
            }] : []),


            {
                element: "#AddProfit_ApplyPartCheckbox",
                intro: t("overheadsProfits.AddProfit_ApplyPartCheckbox"),
            },
            {
                element: "#AddProfit_ProfitApplicabilityId_container",
                intro: t("overheadsProfits.AddProfit_ProfitApplicabilityId_container"),
            },
            {
                element: "#AddProfit_ProfitPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitPercentage"),
            },
            {
                element: "#AddProfit_ProfitRMPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitRMPercentage"),
            },
            {
                element: "#AddProfit_ProfitMachiningCCPercentage",
                intro: t("overheadsProfits.AddProfit_ProfitMachiningCCPercentage"),
            },
            {
                element: "#AddProfit_ProfitBOPPercentage",
                intro: introWithBOPDynamicValue(t("overheadsProfits.AddProfit_ProfitBOPPercentage")),
            },
            {
                element: "#AddProfit_EffectiveDate",
                intro: t("overheadsProfits.AddProfit_EffectiveDate"),
            },
            {
                element: "#AddProfit_Remark",
                intro: t("overheadsProfits.AddProfit_Remark"),
            },
            {
                element: "#AddProfit_UploadFiles",
                intro: t("overheadsProfits.AddProfit_UploadFiles"),
            },
            {
                element: "#AddProfit_Cancel",
                intro: t("overheadsProfits.AddProfit_Cancel"),
            },
            {
                element: "#AddProfit_Save",
                intro: introMessage,
                position: 'left'
            },
        ],
    }
}