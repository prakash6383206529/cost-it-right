import { includes } from "lodash";

export function Steps(t, config) {

    let moduleNames = []

    if (config?.topAndLeftMenuData) {
        moduleNames = config?.topAndLeftMenuData.map(el => el.ModuleName)
    }
    return {

        NAV_BAR: [
            ...includes(moduleNames, "Dashboard") ? [
                {
                    element: "#Dashboard_NavBar",
                    intro: t("navBar.dashboard"),
                    hidePrev: true
                },
            ] : [],

            ...includes(moduleNames, "Master") ? [

                {
                    element: " #Master_NavBar",
                    intro: t("navBar.master"),
                },
            ] : [],
            ...includes(moduleNames, "Additional Masters") ? [
                {
                    element: "#AdditionalMaster_NavBar",
                    intro: t("navBar.additional_master"),
                },
            ] : [],
            ...includes(moduleNames, "Costing") ? [
                {
                    element: "#Costing_NavBar",
                    intro: t("navBar.costing"),

                },
            ] : [],
            ...includes(moduleNames, "Simulation") ? [

                {
                    element: "#Simulation_NavBar",
                    intro: t("navBar.simulation"),
                },
            ] : [],
            ...includes(moduleNames, "Reports And Analytics") ? [
                {
                    element: "#Report_NavBar",
                    intro: t("navBar.reports"),
                },
            ] : [],
            ...includes(moduleNames, "Users") ? [
                {
                    element: ".Users_NavBar",
                    intro: t("navBar.users"),
                },
            ] : [],
            ...includes(moduleNames, "RFQ") ? [
                {
                    element: ".RFQ_NavBar",
                    intro: t("navBar.rfq"),
                }
            ] : [],
            ...includes(moduleNames, "Audit") ? [
                {
                    element: ".Audit_NavBar",
                    intro: t("navBar.audit"),
                },
            ] : [],
            ...includes(moduleNames, "NFR") ? [
                {
                    element: ".NFR_NavBar",
                    intro: t("navBar.nfr"),
                },
            ] : [],








        ],




    };

}
