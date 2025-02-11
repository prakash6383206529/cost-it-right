import { userDetails } from "./auth";
import _ from 'lodash';

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
            Department: JSON.parse(res.Department),
            DepartmentCode: res.DepartmentCode,
            LoggedInSimulationLevel: res.LoggedInSimulationLevel,
            LoggedInSimulationLevelId: res.LoggedInSimulationLevelId,
            LoggedInMasterLevel: res.LoggedInMasterLevel,
            LoggedInMasterLevelId: res.LoggedInMasterLevelId,
            Role: res.Role,
            IsUserDelegatee: res.IsUserDelegatee,
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
            return null
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
            return null
        });
        planListArray.push(planListMonthly);
        planListArray.push(planListYearly);
    }
    return planListArray;
}


export function formatRMSimulationObject(simulationDetail, selectedRowData, costingArr, isRMIndexationSimulation = false) {
    if (simulationDetail && selectedRowData && costingArr) {
        let temp = []
        let tempFinal = []
        let count = 0
        costingArr && costingArr.map(item => {
            let checked = false
            count = 0
            selectedRowData && selectedRowData.map(item1 => {
                if (_.isEqual(item, item1)) {
                    count++
                }
                return null
            })
            if (count === 0) {                                              // NOT EQUAL
                item.IsChecked = false
                tempFinal.push({ CostingId: item?.CostingId ?? null, CostingNumber: item?.CostingNumber ?? null, IsChecked: checked, LineNumber: item?.LineNumber, SANumber: item?.SANumber, RawMaterialId: item?.OldRawMaterialId ?? null })
            }
            return null
        })

        selectedRowData.forEach(object => {
            temp.push({ CostingId: object?.CostingId ?? null, CostingNumber: object.CostingNumber ?? null, IsChecked: true, LineNumber: object?.LineNumber, SANumber: object?.SANumber, RawMaterialId: object?.OldRawMaterialId ?? null })
        });
        let apiArray = [...temp, ...tempFinal]

        // let uniqueArr = [];
        // temp.filter(function(item){
        //     var i = uniqueArr.findIndex(x => (x.CostingId === item.CostingId));
        //     if(i <= -1){
        //       uniqueArr.push(item);
        //      }
        //     return null;
        // });
        let uniqueArr = _.uniqBy(apiArray, function (o) {
            return o.CostingId;
        });


        const simulationObj = {
            SimulationId: simulationDetail.SimulationId,
            Token: simulationDetail.TokenNo,
            Currency: "",
            EffectiveDate: "",
            Remark: "",
            LoggedInUserId: userDetails().LoggedInUserId,
            IsPartialSaved: selectedRowData.length === costingArr.length ? false : true,
            SelectedCostings: isRMIndexationSimulation ? apiArray : uniqueArr,
        };
        return simulationObj;
    }
    return null;
}
