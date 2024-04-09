export function Steps(t, config) {
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");

    return {
        VENDOR_FORM: [
            {
                element: "#AddVendorDrawer_VendorType_container",
                intro: t("vendorForm.AddVendorDrawer_VendorType_container"),
            },
            ...(config && config.isEditFlag === false) ? [

                {
                    element: "#AddVendorDrawer_VendorName",
                    intro: t("vendorForm.AddVendorDrawer_VendorName"),
                },
                {
                    element: "#AddVendorDrawer_VendorCode",
                    intro: t("vendorForm.AddVendorDrawer_VendorCode"),
                }] : [],
            {
                element: "#AddVendorDrawer_VendorEmail",
                intro: t("vendorForm.AddVendorDrawer_VendorEmail"),
            },
            {
                element: "#AddVendorDrawer_PhoneNumber",
                intro: t("vendorForm.AddVendorDrawer_PhoneNumber"),
            },
            {
                element: "#AddVendorDrawer_Extension",
                intro: t("vendorForm.AddVendorDrawer_Extension"),
            },
            {
                element: "#AddVendorDrawer_MobileNumber",
                intro: t("vendorForm.AddVendorDrawer_MobileNumber"),
            },
            ...(config && config.isEditFlag === false) ? [
                {
                    element: "#AddVendorDrawer_CountryId_container",
                    intro: t("vendorForm.AddVendorDrawer_CountryId_container"),
                },
                {
                    element: "#AddVendorDrawer_StateId_container",
                    intro: t("vendorForm.AddVendorDrawer_StateId_container"),
                },
                {
                    element: "#AddVendorDrawer_CityId_container",
                    intro: t("vendorForm.AddVendorDrawer_CityId_container"),
                }] : [],
            {
                element: "#AddVendorDrawer_ZipCode",
                intro: t("vendorForm.AddVendorDrawer_ZipCode"),
            },
            {
                element: "#AddVendorDrawer_AddressLine1",
                intro: t("vendorForm.AddVendorDrawer_AddressLine1"),
            },
            {
                element: "#AddVendorDrawer_AddressLine2",
                intro: t("vendorForm.AddVendorDrawer_AddressLine2"),
            },
            {
                element: "#AddVendorDrawer_Cancel",
                intro: t("vendorForm.AddVendorDrawer_Cancel"),
            },
            {
                element: "#AddVendorDrawer_Save",
                intro: introMessage,
            }
        ],
    }
}