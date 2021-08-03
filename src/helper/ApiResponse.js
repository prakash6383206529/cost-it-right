import { userDetails } from "./auth";

export function formatLoginResult(res) {
    if (res) {
        // const userObj = {
        //     Token: res.Data.Token,
        //     LoggedInUserId: res.Data.LoggedInUserId,
        //     LoggedInLevelId: res.Data.LoggedInLevelId,
        //     LoggedInLevel: res.Data.LoggedInLevel,
        //     UserName: res.Data.UserName,
        //     Name: res.Data.Name,
        //     RememberMe: res.Data.RememberMe,
        //     CompanyId: res.Data.CompanyId,
        //     Company: res.Data.Company,
        //     Title: res.Data.Title,
        //     Email: res.Data.Email,
        //     Mobile: res.Data.Mobile,
        //     NumberOfSupplier: res.Data.NumberOfVendors,
        //     ZBCSupplierInfo: res.Data.ZBCVendorInfo,
        //     Roles: res.Data.Roles,
        //     Plants: res.Data.Plants,
        //     Permissions: res.Data.Permissions,
        //     IsVendorPlantConfigurable: res.Data.IsVendorPlantConfigurable,
        // };
        const userObj = {
            Token: res.access_token,
            RefreshToken: res.refresh_token,
            LoggedInUserId: res.LoggedInUserId,
            LoggedInLevel: res.LoggedInLevel,
            LoggedInLevelId: res.LoggedInLevelId,
            UserName: res.UserName,
            Name: res.Name,
            Email: res.Email,
            ZBCSupplierInfo: {
                PlantId: res.PlantId,
                VendorName: res.VendorName,
                VendorNameWithCode: res.VendorNameWithCode,
            },
            Plants: [{
                PlantCode: res.PlantCode,
                PlantId: res.PlantId,
                PlantName: res.PlantName,
            }],
            IsVendorPlantConfigurable: res.IsVendorPlantConfigurable,
            expires: res[".expires"],
            issued: res[".issued"],
            expires_in: res.expires_in,
            token_type: res.token_type,
            DepartmentId: res.DepartmentId,
            Department: res.Department,
            DepartmentCode: res.DepartmentCode,
            LoggedInSimulationLevel: res.LoggedInSimulationLevel,
            LoggedInSimulationLevelId: res.LoggedInSimulationLevelId,
            Role: res.Role
        };
        return userObj;
    }
    return null;
}

export function formatCloneOpportunityListData(cloneOpportunityListApiData, cloneOpportunityListStoreData) {
    let cloneListValue = [];
    let defaultObj = {
        label: 'Select',
        value: ''
    };
    cloneListValue.push(defaultObj);

    if (cloneOpportunityListApiData.length > 0) {
        cloneOpportunityListApiData.map((val, i) => {
            let obj = {}
            obj['label'] = val.name
            obj['value'] = val._id
            cloneListValue.push(obj);
        })
        return cloneListValue;
    }
    return cloneListValue;
}



export function formatGetPlanResult(result) {
    const planList = result.data.data.reduce((acc, current) => {
        const x = acc.find(item => item.code === current.code);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    const planListArray = [];
    const planListMonthly = [];
    const planListYearly = [];

    if (planList && Array.isArray(planList)) {
        planList.map(item => {
            if (item.code === 'fps') {
                planListYearly.push(item);
                planListMonthly.push(item);
            } else if ((item.intervalLength === 12 && item.state === 'active')) {
                planListYearly.push(item);
            } else if ((item.code !== 'fps' && item.intervalLength === 1 && item.state === 'active')) {
                planListMonthly.push(item);
            }
        });
        planListArray.push(planListMonthly);
        planListArray.push(planListYearly);
    }
    return planListArray;
}


export function formatRMSimulationObject(simulationDetail, selectedRowData, costingArr) {
    console.log('selectedRowData: ', selectedRowData);

    if (simulationDetail && selectedRowData && costingArr) {
        let temp = []
        costingArr && costingArr.map(item => {
            let checked = false
            selectedRowData && selectedRowData.map(item1 => {
                if (item1.CostingId === item.CostingId) {
                    checked = true
                    return false
                }
                return true
            })
            temp.push({ CostingId: item.CostingId, CostingNumber: item.CostingNumber, IsChecked: checked })
        })

        const simulationObj = {
            SimulationId: simulationDetail.SimulationId,
            Token: simulationDetail.TokenNo,
            Currency: "",
            EffectiveDate: "",
            Remark: "",
            LoggedInUserId: userDetails().LoggedInUserId,
            IsPartialSaved: selectedRowData.length === costingArr.length ? false : true,
            SelectedCostings: temp,
        };
        return simulationObj;
    }
    return null;
}