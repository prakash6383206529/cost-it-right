import { reactLocalStorage } from "reactjs-localstorage";

export function Steps(t, config) {
    return {
        ADD_INTEREST_RATE: [

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

            {
                element: "#AddInterestRate_ICCApplicability_container",
                intro: t("InterestRate.AddInterestRate_ICCApplicability"),
            },
            {
                element: "#AddInterestRate_AnnualICC",
                intro: t("InterestRate.AddInterestRate_AnnualICC"),
            },
            {
                element: "#AddInterestRate_PaymentTermsApplicability_container",
                intro: t("InterestRate.AddInterestRate_PaymentTermsApplicability"),
            },
            {
                element: "#AddInterestRate_RepaymentPeriod",
                intro: t("InterestRate.AddInterestRate_RepaymentPeriod"),
            },
            {
                element: "#AddInterestRate_PaymentTermPercent",
                intro: t("InterestRate.AddInterestRate_PaymentTermPercent"),
            },
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
                intro: t("InterestRate.AddInterestRate_Save"),
            },
        ],
    };
}
