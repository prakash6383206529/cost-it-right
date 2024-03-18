export function Steps(t) {
    return {
        ADD_CLIENT: [

            {
                element: "#AddClientDrawer_CompanyName",
                intro: t("customer.company_name"),
            },
            {
                element: "#AddClientDrawer_CompanyCode",
                intro: t("customer.customer_code"),
            },
            {
                element: "#AddClientDrawer_ClientName",
                intro: t("customer.contact_name"),
            },

            {
                element: "#AddClientDrawer_ClientEmailId",
                intro: t("customer.email"),
            },
            {
                element: "#AddClientDrawer_PhoneNumber",
                intro: t("customer.contact_number"),
            },
            {
                element: "#AddClientDrawer_Extension",
                intro: t("customer.ext"),
            },
            {
                element: "#AddClientDrawer_MobileNumber",
                intro: t("customer.mobile_number"),
            },
            {
                element: "#AddClientDrawer_CountryId_container",
                intro: t("customer.country"),
            },
            {
                element: "#AddClientDrawer_StateId_container ",
                intro: t("customer.state"),
            },
            {
                element: "#AddClientDrawer_CityId_container",
                intro: t("customer.city"),
            },
            {
                element: "#AddClientDrawer_ZipCode",
                intro: t("customer.zip_code"),
            },
            {
                element: "#AddClientDrawer_AddressLine1",
                intro: t("customer.address1"),
            },
            {
                element: "#AddClientDrawer_AddressLine2",
                intro: t("customer.address2"),
            },


            {
                element: "#addClient_Cancel",
                intro: t("customer.cancel"),
            },
            {
                element: "#addClient_Save",
                intro: t("customer.save"),
                position: 'left'
            },
        ],

    }
}