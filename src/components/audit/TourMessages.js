export function Steps(t) {
    return {
        AUDIT_LISTING: [
            {
                element: "#filter-text-box",
                intro: t?.("audit.search") || "",
            },
            {
                element: "#Audit_List_FromDate",
                intro: t?.("audit.fromDate") || "",
            },
            {
                element: "#Audit_List_ToDate", // Assuming filter button has this class
                intro: t?.("audit.toDate") || "",
            },

            {
                element: " .ag-text-field-input",
                intro: t?.("audit.floatingFilterInput") || "",
            },
            {
                element: ".ag-floating-filter-button",
                intro: t?.("audit.floatingFilterButton") || "",
            },
            {
                element: "#Audit_List_Filter", // Assuming filter button has this class
                intro: t?.("audit.filter") || "",
            },


            {
                element: "#Audit_List_Download",
                intro: t?.("audit.download") || "",
            },


            {
                element: "#Audit_List_Reset", // Assuming reset button has this class
                intro: t?.("audit.refresh") || "",
            },
        ]
    }
}

