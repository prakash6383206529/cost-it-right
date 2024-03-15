export function Steps(t, config) {
    return {
        ADD_INTEREST_RATE: [

            {
                element: "#AddIntrestRate_ZeroBased",
                intro: t("intrestRate.AddIntrestRate_ZeroBased"),
            },
            {
                element: "#AddIntrestRate_VendorBased",
                intro: t("intrestRate.AddIntrestRate_VendorBased"),
            },
            {
                element: "#AddIntrestRate_CustomerBased",
                intro: t("intrestRate.AddIntrestRate_VendorBased"),
            },

            // {
            //     element: "#AddIntrestRate_RawMaterialName",
            //     intro: t("intrestRate.AddIntrestRate_RawMaterialName"),
            // },
            // {
            //     element: "#AddIntrestRate_RawMaterialGrade",
            //     intro: t("intrestRate.AddIntrestRate_RawMaterialGrade"),
            // },
            ...(config && config.vendorField ? [{

                element: "#AddIntrestRate_VendorName_container",
                intro: t("intrestRate.AddIntrestRate_VendorCode"),
            },] : []),
            ...(config && config.plantField ? [{
                element: "#AddInterestRate_Plant_container",
                intro: t("intrestRate.AddIntrestRate_PlantCode"),
            },] : []),
            ...(config && config.destinationPlant ? [{

                element: "#AddInterestRate_DestinationPlant_container",
                intro: t("intrestRate.AddIntrestRate_DestinationPlant"),
            },] : []),

            // {
            //     element: "#AddIntrestRate_ClientCode",
            //     intro: t("intrestRate.AddIntrestRate_ClientCode"),
            // },
            {
                element: "#AddInterestRate_ICCApplicability_container",
                intro: t("intrestRate.AddIntrestRate_ICCApplicability"),
            },
            {
                element: "#AddIntrestRate_AnnualICC",
                intro: t("intrestRate.AddIntrestRate_AnnualICC"),
            },
            {
                element: "#AddInterestRate_PaymentTermsApplicability_container",
                intro: t("intrestRate.AddIntrestRate_PaymentTermsApplicability"),
            },
            {
                element: "#AddIntrestRate_RepaymentPeriod",
                intro: t("intrestRate.AddIntrestRate_RepaymentPeriod"),
            },
            {
                element: "#AddIntrestRate_PaymentTermPercent",
                intro: t("intrestRate.AddIntrestRate_PaymentTermPercent"),
            },
            {
                element: "#AddInterestRate_EffectiveDate",
                intro: t("intrestRate.AddIntrestRate_EffectiveDate"),

            },
            {
                element: "#AddIntrestRate_Cancel",
                intro: t("intrestRate.AddIntrestRate_Cancel"),
            },
            {
                element: "#AddIntrestRate_Save",
                intro: t("intrestRate.AddIntrestRate_Save"),
            },
        ],
    };
}
