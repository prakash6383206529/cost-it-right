export function Steps(t, config) {
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");

    return {
        Add_ZBCPlant_FORM: [

            {
                element: "#AddZBCPlant_PlantName",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Plant_Name"),
            },
            {
                element: "#AddZBCPlant_PlantCode",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Plant_Code"),
            },
            {
                element: "#AddZBCPlant_CompanyName_container",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Company_Code"),
            },

            {
                element: "#AddZBCPlant_PhoneNumber",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Phone_Number"),
            },
            {
                element: "#AddZBCPlant_Extension",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Ext"),
            },
            {
                element: "#AddZBCPlant_AddressLine1",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Address1"),
            },
            {
                element: "#AddZBCPlant_AddressLine2",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Address2"),
            },
            {
                element: "#AddZBCPlant_CountryId_container",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Country"),
            },
            {
                element: "#AddZBCPlant_StateId_container",
                intro: t("addZBCPlantRate.AddZBCPlantRate_State"),
            },
            {
                element: "#AddZBCPlant_CityId_container",
                intro: t("addZBCPlantRate.AddZBCPlantRate_City"),
            },
            {
                element: "#AddZBCPlant_ZipCode",
                intro: t("addZBCPlantRate.AddZBCPlantRate_ZipCode"),
            },
            {
                element: "#AddZBCPlantRate_Cancel",
                intro: t("addZBCPlantRate.AddZBCPlantRate_Cancel"),
            },
            {
                element: "#AddZBCPlantRate_Save",
                intro: introMessage,
            },

        ],
    }
}