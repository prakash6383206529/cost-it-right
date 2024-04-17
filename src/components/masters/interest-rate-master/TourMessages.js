import { reactLocalStorage } from "reactjs-localstorage";

export function Steps(t, config) {
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");
    const annualICC = (config && config.isEditFlag === false) ? t("InterestRate.AddInterestRate_AnnualICC") : t("InterestRate.AddInterestRate_Edit_AnnualICC");
    const repaymentPeriod = (config && config.isEditFlag === false) ? t("InterestRate.AddInterestRate_RepaymentPeriod") : t("InterestRate.AddInterestRate_Edit_RepaymentPeriod");
    const paymentTermPercent = (config && config.isEditFlag === false) ? t("InterestRate.AddInterestRate_PaymentTermPercent") : t("InterestRate.AddInterestRate_Edit_PaymentTermPercent");

    return {
        ADD_INTEREST_RATE: [
            ...(config && config.isEditFlag === false) ? [
                {
                    element: "#AddInterestRate_ZeroBased",
                    intro: t("InterestRate.AddInterestRate_ZeroBased"),
                },
                {
                    element: "#AddInterestRate_VendorBased",
                    intro: t("InterestRate.AddInterestRate_VendorBased"),
                },
                ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                    element: "#AddInterestRate_CustomerBased",
                    intro: t("InterestRate.AddInterestRate_VendorBased"),
                }] : []),

                // {
                //     element: "#AddInterestRate_RawMaterialName",
                //     intro: t("InterestRate.AddInterestRate_RawMaterialName"),
                // },
                // {
                //     element: "#AddInterestRate_RawMaterialGrade",
                //     intro: t("InterestRate.AddInterestRate_RawMaterialGrade"),
                // },
                ...(config && config.vendorField ? [{

                    element: "#AddInterestRate_VendorName_container",
                    intro: t("InterestRate.AddInterestRate_VendorCode"),
                },] : []),
                ...(config && config.customerField ? [{


                    element: "#AddInterestRate_clientName_container",
                    intro: t("InterestRate.AddInterestRate_ClientCode"),
                },
                ] : []),
                ...(config && config.plantField ? [{
                    element: "#AddInterestRate_Plant_container",
                    intro: t("InterestRate.AddInterestRate_PlantCode"),
                },] : []),

                ...(config && config.destinationPlant ? [{

                    element: "#AddInterestRate_DestinationPlant_container",
                    intro: t("InterestRate.AddInterestRate_DestinationPlant"),
                },] : []),
            ] : [],

            {
                element: "#AddInterestRate_ICCApplicability_container",
                intro: t("InterestRate.AddInterestRate_ICCApplicability"),
            },
            ...(config && config?.ICCApplicability && config.ICCApplicability.value !== "Fixed")
                ? [{
                    element: "#AddInterestRate_AnnualICC",
                    intro: annualICC,
                }] : [],


            {
                element: "#AddInterestRate_PaymentTermsApplicability_container",
                intro: t("InterestRate.AddInterestRate_PaymentTermsApplicability"),
            },
            ...(config && config.PaymentTermsApplicability && config.PaymentTermsApplicability.value !== 'Fixed')
                ? [{
                    element: "#AddInterestRate_RepaymentPeriod",
                    intro: repaymentPeriod,
                },
                {
                    element: "#AddInterestRate_PaymentTermPercent",
                    intro: paymentTermPercent,
                },
                ] : [],
            {
                element: "#AddInterestRate_EffectiveDate",
                intro: t("InterestRate.AddInterestRate_EffectiveDate"),

            },
            {
                element: "#AddInterestRate_Cancel",
                intro: t("InterestRate.AddInterestRate_Cancel"),
            },
            {
                element: "#AddInterestRate_Save",
                intro: introMessage,
            },
        ],
    };
}
