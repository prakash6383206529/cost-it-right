export function formatLoginResult(res) {
    if (res.Data) {
        const userObj = {
            Token: res.Data.Token,
            LoggedInUserId: res.Data.LoggedInUserId,
            LoggedInLevelId: res.Data.LoggedInLevelId,
            UserName: res.Data.UserName,
            Name: res.Data.Name,
            RememberMe: res.Data.RememberMe,
            CompanyId: res.Data.CompanyId,
            Company: res.Data.Company,
            Title: res.Data.Title,
            Email: res.Data.Email,
            Mobile: res.Data.Mobile,
            NumberOfSupplier: res.Data.NumberOfVendors,
            ZBCSupplierInfo: res.Data.ZBCVendorInfo,
            Roles: res.Data.Roles,
            Plants: res.Data.Plants,
            Permissions: res.Data.Permissions,
        };
        //console.log("userObj", userObj)
        return userObj;
    }
    return null;
}

export function formatGetUserProfileResult(result) {
    const data = result;
    if (result.account && data.account.profile) {
        const email = data.user.email;

        let actObj = {
            id: data.user._id,
            firstName: data.account.profile.firstName,
            vanityURL: (email && typeof email == 'string' && email != '') ? email.split("@")[0] : email,
            aboutSummary: data.account.profile.aboutSummary,
            profileImage: data.account.profileMedia.uniqueFilename,
            headshot: data.account.headshotMedia.uniqueFilename,
            categories: data.account.profile.categories, // intentionaly left blank
            educationalTraining: data.account.profile.educationalTraining,
            tvExperiences: data.account.profile.tvExperiences,
            filmExperiences: data.account.profile.filmExperiences,
            theatreExperiences: data.account.profile.theatreExperiences,
            disabilities: data.account.profile.disabilities,
            performances: data.account.profile.performances,
            appearances: data.account.profile.appearances,
            accents: data.account.profile.accents,
            languages: data.account.profile.languages,
            sports: data.account.profile.sports,
            accolades: data.account.profile.accolades,
            unions: data.account.profile.unions,
            ethnics: data.account.profile.ethnics,
            nonUnionOk: data.account.profile.nonUnionOk,
            minorWorkPermit: data.account.profile.minorWorkPermit,
            minorTrustAccount: data.account.profile.minorTrustAccount,
            workPermit: data.account.profile.workPermit,
            over18: data.account.profile.over18,
            eyes: data.account.profile.eyes,
            hairLength: data.account.profile.hairLength,
            gender: data.account.profile.gender,
            hair: data.account.profile.hair,
            weight: data.account.profile.weight,
            heightInches: data.account.profile.heightInches,
            heightFeet: data.account.profile.heightFeet,
            ageRangeMax: data.account.profile.ageRangeMax,
            ageRangeMin: data.account.profile.ageRangeMin,
            birthDate: data.account.profile.birthDate,
            lastName: data.account.profile.lastName,
            middleName: data.account.profile.middleName,
            profileSkin: data.account.profile.profileSkin,
            communicationPreference: data.account.communicationPreference,
            mileRadius: data.account.mileRadius,
            country: data.account.country,
            countryPublic: data.account.countryPublic,
            zip: data.account.zip,
            state: data.account.state,
            statePublic: data.account.statePublic,
            city: data.account.city,
            cityPublic: data.account.cityPublic,
            address: data.account.address,
            addressPublic: data.account.addressPublic,
            phone2Carrier: data.account.phone2Carrier,
            phone2TextOk: data.account.phone2TextOk,
            phone2: data.account.phone2,
            phoneCarrier: data.account.phoneCarrier,
            phoneTextOk: data.account.phoneTextOk,
            phone: data.account.phone,
            accountType: data.account.accountType,
            profileVisibility: data.account.profile.profileVisibility, // Intentionally kept false as key does not exist in response
            contactNumber: data.account.profile.contactNumber,
            unionStatus: data.account.profile.unionStatus,
            links: data.account.links,
            media: data.account.media,
            email: data.user.email,
            isBasicInfoCompleted: data.account.isBasicInfoCompleted,
            isShowAddressPublicly: data.account.profile.isShowAddressPublicly,
            followerCount: data.account.followers.length,
            followingCount: data.account.following.length,
            followingUser: data.account.following,
            followerUser: data.account.followers,
            blockedUser: data.account.blockedUsers,
            viewersCount: data.numbersOfViewers
        };
        return actObj;
    }
    return null;
}
// Need to check condition and array .
export function formatGetCompanyProfileResult(result) {
    const data = result;
    if (result._id) {
        let actObj = {
            id: result._id,
            productionProfileImage: result.profileMedia.uniqueFilename,
            productionHeadshotImage: result.headshotMedia.uniqueFilename,
            directorDetails: result.directorDetails,
            producerDetails: result.producerDetails,
            conductorDetails: result.conductorDetails,
            published: result.published,
            listingLevel: result.listingLevel,
            listingOwnerPrivatePhone: result.listingOwnerPrivatePhone ? result.listingOwnerPrivatePhone : '',
            listingOwnerPrivateEmail: result.listingOwnerPrivateEmail,
            listingOwnerPrivateFullName: result.listingOwnerPrivateFullName,
            otherLink: result.otherLink,
            musicallyLink: result.musicallyLink,
            youtubeLink: result.youtubeLink,
            instagramLink: result.instagramLink,
            twitterLink: result.twitterLink,
            facebookLink: result.facebookLink,
            website: result.website,
            data: result.data,
            services: result.services,
            longDescription: result.longDescription,
            shortDescription: result.shortDescription,
            publicEmail: result.publicEmail,
            publicTollFree: result.publicTollFree,
            publicPhone: result.publicPhone,
            categories: result.categories ? result.categories : [],
            country: result.country,
            zipCode: result.zipCode,
            state: result.state,
            city: result.city,
            address: result.address,
            listingType: result.listingType ? result.listingType : [],
            name: result.name,
            profileType: 'Premium' // Not available in api
        };
        return actObj;
    }
    return null;
}

export function formatAddress(address, city, state, country, zipCode) {
    const formatedAddress = [address, city, state, country, zipCode];
    const res = formatedAddress.filter(Boolean).join(', ');
    return res;
}


export function formatGetOpportunitiesResult(result) {
    const opportunityDataObj = {};
    const opportunities = [];
    const opportunitiesList = result.data;
    if (opportunitiesList && Array.isArray(opportunitiesList)) {


        opportunitiesList.map((data, index) => {
            //Finding ramdo lat long 
            let longitude = (Math.random() * 360 - 180).toFixed(8);
            let latitude = (Math.random() * 180 - 90).toFixed(8);
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    loc: [latitude, longitude],
                    userCreated: data.userCreated,
                    image: data.media.length > 0 ? data.media[0].uniqueFilename : '',
                    synopsis: data.synopsis,
                    zipCode: data.zipCode,
                    eventDate: data.eventDate,
                    name: data.name,
                    address: formatAddress(data.address, data.city, data.state, data.country, data.zipCode),
                    typeOfOpportunity: data.opportunityType,
                    opportunitySubType: data.opportunitySubType,
                    productionName: data.productionCompany,
                    published: data.published,
                    publishedOn: data.publishedOn,
                    countOfRoles: data.roles.length,
                    auditionSlotScedule: data.auditionSlotScedule,
                    bookMarkFlag: data.bookMarkFlag ? data.bookMarkFlag.isBookmarked : false,
                    bookMarkDate: data.bookMarkFlag ? data.bookMarkFlag.date : '',
                    companyDetail: data.companyDetail,
                    productionLocation: data.productionLocation
                };
                opportunities.push(actObj);
            }
        });
        opportunityDataObj.opportunityList = opportunities;
        opportunityDataObj.currentPage = result.pages ? result.pages.current : 1;
        opportunityDataObj.nextPage = result.pages ? result.pages.next : 2;
        opportunityDataObj.totalPage = result.pages ? result.pages.total : 0;
        opportunityDataObj.totalRecords = result.items ? result.items.total : 0;
    }
    return opportunityDataObj;
}

export function formatCreateOpportunitiesResult(opportunityApiData, opportunityOldStoreData) {
    console.log("opportunityApiData >>>", opportunityApiData);
    let opportunityUpdateStoreData = opportunityOldStoreData;

    if (opportunityApiData.data.opportunityDetails._id) {
        opportunityUpdateStoreData._id = opportunityApiData.data.opportunityDetails._id;
        opportunityUpdateStoreData.draftedStep = opportunityApiData.data.opportunityDetails.draftedStep;
        opportunityUpdateStoreData.name = opportunityApiData.data.opportunityDetails.name;
        opportunityUpdateStoreData.opportunityType = opportunityApiData.data.opportunityDetails.opportunityType;
        opportunityUpdateStoreData.subOpportunityType = opportunityApiData.data.opportunityDetails.subOpportunityType;
        opportunityUpdateStoreData.eventDate = opportunityApiData.data.opportunityDetails.eventDate;
        opportunityUpdateStoreData.synopsis = opportunityApiData.data.opportunityDetails.synopsis;
        opportunityUpdateStoreData.compensation = opportunityApiData.data.opportunityDetails.compensation;
        opportunityUpdateStoreData.compensationTypes = opportunityApiData.data.opportunityDetails.compensationTypes;
        opportunityUpdateStoreData.workPermit = opportunityApiData.data.opportunityDetails.workPermit;
        opportunityUpdateStoreData.unionStatus = opportunityApiData.data.opportunityDetails.unionStatus;
        opportunityUpdateStoreData.productionCompanyId = opportunityApiData.data.opportunityDetails.productionCompanyId;
        opportunityUpdateStoreData.director = opportunityApiData.data.opportunityDetails.director;
        opportunityUpdateStoreData.directorLink = opportunityApiData.data.opportunityDetails.directorLink;
        opportunityUpdateStoreData.producer = opportunityApiData.data.opportunityDetails.producer;
        opportunityUpdateStoreData.producerLink = opportunityApiData.data.opportunityDetails.producerLink;
        opportunityUpdateStoreData.conductor = opportunityApiData.data.opportunityDetails.conductor;
        opportunityUpdateStoreData.conductorLink = opportunityApiData.data.opportunityDetails.conductorLink;
        opportunityUpdateStoreData.holdingAuditions = opportunityApiData.data.opportunityDetails.holdingAuditions;
        opportunityUpdateStoreData.scheduleAuditions = opportunityApiData.data.opportunityDetails.scheduleAuditions;
        opportunityUpdateStoreData.auditionSlotScedule = opportunityApiData.data.opportunityDetails.auditionSlotScedule;
        opportunityUpdateStoreData.callbackDate = opportunityApiData.data.opportunityDetails.callbackDate;
        opportunityUpdateStoreData.expiryDate = opportunityApiData.data.opportunityDetails.expiryDate;
        opportunityUpdateStoreData.rehearsalStart = opportunityApiData.data.opportunityDetails.rehearsalStart;
        opportunityUpdateStoreData.isRehearsalLocationSameAsTheterLocation = opportunityApiData.data.opportunityDetails.isRehearsalLocationSameAsTheterLocation;
        opportunityUpdateStoreData.rehearsalLocation = opportunityApiData.data.opportunityDetails.rehearsalLocation;
        opportunityUpdateStoreData.productionDatesAndTimes = opportunityApiData.data.opportunityDetails.productionDatesAndTimes;
        opportunityUpdateStoreData.isProducationLocationSameAsTheterLocation = opportunityApiData.data.opportunityDetails.isProducationLocationSameAsTheterLocation;
        opportunityUpdateStoreData.productionLocation = opportunityApiData.data.opportunityDetails.productionLocation;
        opportunityUpdateStoreData.published = opportunityApiData.data.opportunityDetails.published;
        opportunityUpdateStoreData.media = opportunityApiData.data.opportunityDetails.media;

        const newFormData = {
            ...opportunityUpdateStoreData,
        };
        console.log("opportunityApiData", opportunityApiData)
        console.log("opportunityUpdateStoreData", opportunityUpdateStoreData)
        return newFormData;
    }
    return null;
}

export function formatCreateOpportunitiesPublishResult(opportunityOldStoreData) {

    const newFormData = {
        _id: '',
        isClone: false,
        clonedOpportunityId: '',
        draftedStep: 1,
        name: '',
        opportunityType: '',
        eventDate: '',
        synopsis: '',
        compensation: false,
        compensationTypes: [],
        workPermit: false,
        unionStatus: false,
        media: [],
        holdingAuditions: false,
        scheduleAuditions: false,
        auditionSlotScedule: [
        ],
        callbackDate: '',
        expiryDate: '',
        rehearsalStart: '',
        isRehearsalLocationSameAsTheterLocation: false,
        rehearsalLocation: {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: ''
        },
        productionDatesAndTimes: [],
        isProducationLocationSameAsTheterLocation: false,
        productionLocation: {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: ''
        },
        published: false,
        publishedOn: '',
        isActive: false,
        isExpired: false
    };

    return newFormData;
}


export function formatCreateOpportunitiesCloneResult(opportunityCloneApiData, opportunityOldStoreData) {
    let opportunityUpdateStoreData = opportunityOldStoreData;

    if (opportunityCloneApiData.data.draftedStep !== 1) {
        if (opportunityCloneApiData.data._id) {
            opportunityUpdateStoreData._id = opportunityCloneApiData;

            const newFormData = {
                ...opportunityUpdateStoreData,
            };

            return newFormData;
        }
    }
    const newFormData1 = {
        ...opportunityUpdateStoreData,
    };
    return newFormData1;

}

export function formatCreateOpportunitiesDetailCloneResult(opportunityDetailApiData, opportunityOldStoreData) {
    let opportunityUpdateStoreData = opportunityOldStoreData;
    if (opportunityDetailApiData.data.opportunityDetails._id) {
        opportunityUpdateStoreData._id = '';
        opportunityUpdateStoreData.draftedStep = 1;
        opportunityUpdateStoreData.isClone = true;
        opportunityUpdateStoreData.name = opportunityDetailApiData.data.opportunityDetails.name;
        opportunityUpdateStoreData.opportunityType = opportunityDetailApiData.data.opportunityDetails.opportunityType;
        opportunityUpdateStoreData.opportunitySubType = opportunityDetailApiData.data.opportunityDetails.opportunitySubType;
        opportunityUpdateStoreData.eventDate = '';
        opportunityUpdateStoreData.synopsis = opportunityDetailApiData.data.opportunityDetails.synopsis;
        opportunityUpdateStoreData.compensation = opportunityDetailApiData.data.opportunityDetails.compensation;
        opportunityUpdateStoreData.compensationTypes = opportunityDetailApiData.data.opportunityDetails.compensationTypes;
        opportunityUpdateStoreData.workPermit = opportunityDetailApiData.data.opportunityDetails.workPermit;
        opportunityUpdateStoreData.unionStatus = opportunityDetailApiData.data.opportunityDetails.unionStatus;
        opportunityUpdateStoreData.productionCompanyId = opportunityDetailApiData.data.opportunityDetails.productionCompanyId;
        opportunityUpdateStoreData.director = opportunityDetailApiData.data.opportunityDetails.director;
        opportunityUpdateStoreData.directorLink = opportunityDetailApiData.data.opportunityDetails.directorLink;
        opportunityUpdateStoreData.producer = opportunityDetailApiData.data.opportunityDetails.producer;
        opportunityUpdateStoreData.producerLink = opportunityDetailApiData.data.opportunityDetails.producerLink;
        opportunityUpdateStoreData.conductor = opportunityDetailApiData.data.opportunityDetails.conductor;
        opportunityUpdateStoreData.conductorLink = opportunityDetailApiData.data.opportunityDetails.conductorLink;
        opportunityUpdateStoreData.holdingAuditions = opportunityDetailApiData.data.opportunityDetails.holdingAuditions;
        opportunityUpdateStoreData.scheduleAuditions = opportunityDetailApiData.data.opportunityDetails.scheduleAuditions;
        opportunityUpdateStoreData.auditionSlotScedule = [];
        opportunityUpdateStoreData.callbackDate = '';
        opportunityUpdateStoreData.expiryDate = '';
        opportunityUpdateStoreData.rehearsalStart = '';
        opportunityUpdateStoreData.isRehearsalLocationSameAsTheterLocation = opportunityDetailApiData.data.opportunityDetails.isRehearsalLocationSameAsTheterLocation;
        opportunityUpdateStoreData.rehearsalLocation = opportunityDetailApiData.data.opportunityDetails.rehearsalLocation;
        opportunityUpdateStoreData.productionDatesAndTimes = [];
        opportunityUpdateStoreData.isProducationLocationSameAsTheterLocation = opportunityDetailApiData.data.opportunityDetails.isProducationLocationSameAsTheterLocation;
        opportunityUpdateStoreData.productionLocation = opportunityDetailApiData.data.opportunityDetails.productionLocation;
        opportunityUpdateStoreData.published = false;
        opportunityUpdateStoreData.media = opportunityDetailApiData.data.opportunityDetails.media;


        const newFormData = {
            ...opportunityUpdateStoreData,
        };

        return newFormData;
    }
    return null;
}

export function formatCreateOpportunitiesDetailResult(opportunityDetailApiData, opportunityOldStoreData) {
    console.log("opportunityDetailApiData => ", opportunityDetailApiData.data.opportunityDetails);
    let opportunityUpdateStoreData = opportunityOldStoreData;
    if (opportunityDetailApiData.data.opportunityDetails._id) {
        opportunityUpdateStoreData._id = opportunityDetailApiData.data.opportunityDetails._id;
        opportunityUpdateStoreData.draftedStep = 1;
        opportunityUpdateStoreData.name = opportunityDetailApiData.data.opportunityDetails.name;
        opportunityUpdateStoreData.opportunityType = opportunityDetailApiData.data.opportunityDetails.opportunityType;
        opportunityUpdateStoreData.opportunitySubType = opportunityDetailApiData.data.opportunityDetails.opportunitySubType;
        opportunityUpdateStoreData.eventDate = opportunityDetailApiData.data.opportunityDetails.eventDate;
        opportunityUpdateStoreData.synopsis = opportunityDetailApiData.data.opportunityDetails.synopsis;
        opportunityUpdateStoreData.compensation = opportunityDetailApiData.data.opportunityDetails.compensation;
        opportunityUpdateStoreData.compensationTypes = opportunityDetailApiData.data.opportunityDetails.compensationTypes;
        opportunityUpdateStoreData.workPermit = opportunityDetailApiData.data.opportunityDetails.workPermit;
        opportunityUpdateStoreData.unionStatus = opportunityDetailApiData.data.opportunityDetails.unionStatus;
        opportunityUpdateStoreData.productionCompanyId = opportunityDetailApiData.data.opportunityDetails.productionCompanyId;
        opportunityUpdateStoreData.productionCompany = opportunityDetailApiData.data.companyDetail.name;
        opportunityUpdateStoreData.address = opportunityDetailApiData.data.companyDetail.address;
        opportunityUpdateStoreData.country = opportunityDetailApiData.data.companyDetail.country;
        opportunityUpdateStoreData.state = opportunityDetailApiData.data.companyDetail.state;
        opportunityUpdateStoreData.city = opportunityDetailApiData.data.companyDetail.city;
        opportunityUpdateStoreData.zipCode = opportunityDetailApiData.data.companyDetail.zipCode;
        opportunityUpdateStoreData.additionalInformation = opportunityDetailApiData.data.companyDetail.additionalInformation;
        opportunityUpdateStoreData.website = opportunityDetailApiData.data.companyDetail.website;
        opportunityUpdateStoreData.contact = opportunityDetailApiData.data.companyDetail.contact;
        opportunityUpdateStoreData.director = (opportunityDetailApiData.data.opportunityDetails && opportunityDetailApiData.data.opportunityDetails.director) ? opportunityDetailApiData.data.opportunityDetails.director : opportunityDetailApiData.data.companyDetail.director;
        opportunityUpdateStoreData.directorLink = (opportunityDetailApiData.data.opportunityDetails && opportunityDetailApiData.data.opportunityDetails.directorLink) ? opportunityDetailApiData.data.opportunityDetails.directorLink : opportunityDetailApiData.data.companyDetail.directorLink;
        opportunityUpdateStoreData.producer = (opportunityDetailApiData.data.opportunityDetails && opportunityDetailApiData.data.opportunityDetails.producer) ? opportunityDetailApiData.data.opportunityDetails.producer : opportunityDetailApiData.data.companyDetail.producer;
        opportunityUpdateStoreData.producerLink = (opportunityDetailApiData.data.opportunityDetails && opportunityDetailApiData.data.opportunityDetails.producerLink) ? opportunityDetailApiData.data.opportunityDetails.producerLink : opportunityDetailApiData.data.companyDetail.producerLink;
        opportunityUpdateStoreData.conductor = (opportunityDetailApiData.data.opportunityDetails && opportunityDetailApiData.data.opportunityDetails.conductor) ? opportunityDetailApiData.data.opportunityDetails.conductor : opportunityDetailApiData.data.companyDetail.conductor;
        opportunityUpdateStoreData.conductorLink = (opportunityDetailApiData.data.opportunityDetails && opportunityDetailApiData.data.opportunityDetails.conductorLink) ? opportunityDetailApiData.data.opportunityDetails.conductorLink : opportunityDetailApiData.data.companyDetail.conductorLink;
        opportunityUpdateStoreData.holdingAuditions = opportunityDetailApiData.data.opportunityDetails.holdingAuditions;
        opportunityUpdateStoreData.scheduleAuditions = opportunityDetailApiData.data.opportunityDetails.scheduleAuditions;
        opportunityUpdateStoreData.auditionSlotScedule = opportunityDetailApiData.data.opportunityDetails.auditionSlotScedule;
        opportunityUpdateStoreData.callbackDate = opportunityDetailApiData.data.opportunityDetails.callbackDate;
        opportunityUpdateStoreData.expiryDate = opportunityDetailApiData.data.opportunityDetails.expiryDate;
        opportunityUpdateStoreData.rehearsalStart = opportunityDetailApiData.data.opportunityDetails.rehearsalStart;
        opportunityUpdateStoreData.isRehearsalLocationSameAsTheterLocation = opportunityDetailApiData.data.opportunityDetails.isRehearsalLocationSameAsTheterLocation;
        opportunityUpdateStoreData.rehearsalLocation = opportunityDetailApiData.data.opportunityDetails.rehearsalLocation;
        opportunityUpdateStoreData.productionDatesAndTimes = opportunityDetailApiData.data.opportunityDetails.productionDatesAndTimes;
        opportunityUpdateStoreData.isProducationLocationSameAsTheterLocation = opportunityDetailApiData.data.opportunityDetails.isProducationLocationSameAsTheterLocation;
        opportunityUpdateStoreData.productionLocation = opportunityDetailApiData.data.opportunityDetails.productionLocation;
        opportunityUpdateStoreData.published = opportunityDetailApiData.data.opportunityDetails.published === true ? true : false;
        opportunityUpdateStoreData.media = opportunityDetailApiData.data.opportunityDetails.media;
        opportunityUpdateStoreData.bookMarkFlag = opportunityDetailApiData.data.opportunityDetails.bookMarkFlag ? opportunityDetailApiData.data.opportunityDetails.bookMarkFlag.isBookmarked : false;
        opportunityUpdateStoreData.bookMarkDate = opportunityDetailApiData.data.opportunityDetails.bookMarkFlag ? opportunityDetailApiData.data.opportunityDetails.bookMarkFlag.date : '';
        opportunityUpdateStoreData.roleCount = opportunityDetailApiData.data.opportunityDetails.roles.length;
        opportunityUpdateStoreData.userCreated = opportunityDetailApiData.data.opportunityDetails.userCreated

        const newFormData = {
            ...opportunityUpdateStoreData,
        };
        console.log("opportunityUpdateStoreData", opportunityUpdateStoreData)
        return newFormData;
    }
    return null;
}

export function formatCloneOpportunityListData(cloneOpportunityListApiData, cloneOpportunityListStoreData) {
    // console.log("opportunityLISTApiData Nilesh => " + JSON.stringify(cloneOpportunityListApiData));
    let cloneOpportunityListUpdatedStoreData = cloneOpportunityListStoreData;
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
        // console.log("cloneListValue =>" + JSON.stringify(cloneListValue));

        return cloneListValue;
    }
    return cloneListValue;
}

export function formatGetCompanyListResult(result) {
    const companyDataObj = {};
    const companies = [];
    const companyList = result.data;
    if (companyList && Array.isArray(companyList)) {


        companyList.map((data, index) => {
            let longitude = (Math.random() * 360 - 180).toFixed(8);
            let latitude = (Math.random() * 180 - 90).toFixed(8);
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    loc: data.loc,
                    userCreated: data.userCreated,
                    image: data.profileMedia ? data.profileMedia.uniqueFilename : '',                    // synopsis: data.synopsis,
                    name: data.name,
                    address: formatAddress(data.address, data.city, data.state, data.country, data.zipCode),
                    listingType: data.listingType,
                    publicPhone: data.publicPhone,
                    website: data.website,
                    shortDescription: data.shortDescription,
                };
                companies.push(actObj);
            }
        });
        companyDataObj.companyList = companies;
        companyDataObj.currentPage = result.pages ? result.pages.current : 1;
        companyDataObj.nextPage = result.pages ? result.pages.next : 2;
        companyDataObj.totalPage = result.pages ? result.pages.total : 0;
        companyDataObj.totalRecords = result.items ? result.items.total : 0;
    }
    return companyDataObj;
}

export function formatCompanyListFilterResult() {
    const newFormData = {
        limit: 10,
        name: '',
        loc: '',
        listingType: '',
        categories: [],
        sortBy: 'distance',
        locAddress: '',
        isFilterApplied: false
    };
    return newFormData;
}

export function formatTalentDirectoryFilterResult() {
    const newFormData = {
        limit: 10,
        gender: '',
        ageRange: [18, 100],
        unionStatus: '',
        disabilities: [],
        accents: [],
        sports: [],
        weightRange: [0, 1000],
        heightRange: [0, 10],
        languages: [],
        performance: [],
        sortBy: 'distance',
        name: '',
        loc: '',
        locAddress: ''
    };
    return newFormData;
}

export function formatGetTalentDirectoryResult(result) {
    const talentDirectoryDataObj = {};
    const talentDirectory = [];
    const talentDirectoryList = result.data;
    if (talentDirectoryList && Array.isArray(talentDirectoryList)) {
        talentDirectoryList.map((data, index) => {
            //Finding ramdo lat long
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    loc: data.loc,
                    userCreated: data.userCreated,
                    profile: data.profile,
                    image: data.profileMedia ? data.profileMedia.uniqueFilename : '',
                    name: data.name,
                    address: formatAddress(data.address, data.city, data.state, data.country),
                    userDeatil: data.user,
                    isFollowed: data.isFollowed ? data.isFollowed : false,
                };
                talentDirectory.push(actObj);
            }
        });
        talentDirectoryDataObj.talentDirectoryList = talentDirectory;
        talentDirectoryDataObj.currentPage = result.pages ? result.pages.current : 1;
        talentDirectoryDataObj.nextPage = result.pages ? result.pages.next : 2;
        talentDirectoryDataObj.totalPage = result.pages ? result.pages.total : 0;
        talentDirectoryDataObj.totalRecords = result.items ? result.items.total : 0;
    }
    return talentDirectoryDataObj;
}


export function formatGetFollowingResult(result) {
    const followingDataObj = {};
    const following = [];
    const followingList = result.data;
    if (followingList && Array.isArray(followingList)) {
        followingList.map((data, index) => {
            //Finding ramdo lat long
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    loc: data.loc,
                    userCreated: data.userCreated,
                    profile: data.profile,
                    image: data.profileMedia ? data.profileMedia.uniqueFilename : '',
                    name: data.name,
                    address: formatAddress(data.address, data.city, data.state, data.country),
                    userDeatil: data.user,
                    //isFollowed: data.isFollowed ? data.isFollowed : false,
                };
                following.push(actObj);
            }
        });
        followingDataObj.followingList = following;
        followingDataObj.currentPage = result.pages ? result.pages.current : 1;
        followingDataObj.nextPage = result.pages ? result.pages.next : 2;
        followingDataObj.totalPage = result.pages ? result.pages.total : 0;
        followingDataObj.totalRecords = result.items ? result.items.total : 0;
    }
    return followingDataObj;
}

export function formatGetFollowersResult(result) {
    const followersDataObj = {};
    const followers = [];
    const followerList = result.data;
    if (followerList && Array.isArray(followerList)) {
        followerList.map((data, index) => {
            //Finding ramdo lat long
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    loc: data.loc,
                    userCreated: data.userCreated,
                    profile: data.profile,
                    image: data.profileMedia ? data.profileMedia.uniqueFilename : '',
                    name: data.name,
                    address: formatAddress(data.address, data.city, data.state, data.country),
                    userDeatil: data.user,
                    isFollowed: data.isFollowed ? data.isFollowed : false,
                };
                followers.push(actObj);
            }
        });
        followersDataObj.followerList = followers;
        followersDataObj.currentPage = result.pages ? result.pages.current : 1;
        followersDataObj.nextPage = result.pages ? result.pages.next : 2;
        followersDataObj.totalPage = result.pages ? result.pages.total : 0;
        followersDataObj.totalRecords = result.items ? result.items.total : 0;
    }
    return followersDataObj;
}

export function formatGetUserViewerListResult(result) {
    const viewersDataObj = {};
    const viewers = [];
    const viewerList = result.viewersList;
    if (viewerList && Array.isArray(viewerList)) {
        viewerList.map((data, index) => {
            //Finding ramdo lat long
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    loc: data.userDetails.loc,
                    image: data.userDetails ? data.userDetails.profileMedia.uniqueFilename : '',
                    name: data.userDetails.name,
                    address: formatAddress(data.userDetails.address, data.userDetails.city, data.userDetails.state, data.userDetails.country),
                    userDeatil: data.userDetails.user,
                    viewDate: data.reviewAt
                };
                viewers.push(actObj);
            }
        });
        viewersDataObj.viewerList = viewers;
        viewersDataObj.currentPage = result.pages ? result.pages.current : 1;
        viewersDataObj.nextPage = result.pages ? result.pages.next : 2;
        viewersDataObj.totalRecords = result.viewersCount ? result.viewersCount : 0;
    }
    return viewersDataObj;
}

export function formatGetInAppNotificationListResult(result) {
    const notificationDataObj = {};
    const InAppNotifications = [];
    const InAppNotificationsList = result.data;
    if (InAppNotificationsList && Array.isArray(InAppNotificationsList)) {
        InAppNotificationsList.map((data, index) => {
            //Finding ramdo lat long
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    notificationCreated: data.notificationCreated,
                    isRead: data.isRead,
                    typeOfNotification: data.typeOfNotification,
                    redirectInfo: data.redirectInfo,
                    image: data.image ? data.image.uniqueFilename : '',
                    sendToUserId: data.sendToUserId,
                    sendFromUserId: data.sendFromUserId
                };
                InAppNotifications.push(actObj);
            }
        });
        notificationDataObj.inAppNotificationsList = InAppNotifications;
        notificationDataObj.currentPage = result.pages ? result.pages.current : 1;
        notificationDataObj.nextPage = result.pages ? result.pages.next : 2;
        notificationDataObj.totalRecords = result.items ? result.items.total : 0;
    }
    return notificationDataObj;
}

export function formatGetPlanResult(result) {
    console.log(result.data.data, 'result.data.data');

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

export function formatChartFilterResult() {
    const newFormData = {
        userId: '',
        sortBy: 'day',
    };
    return newFormData;
}

export function formatDistanceSortingResult() {
    const newFormData = {
        limit: 5,
        gender: '',
        unionStatus: '',
        ageRange: [18, 100],
        mileRange: 30,
    };
    return newFormData;
}

/**
* @method formatGetMutualFollowerData
* @description format clone opportunity  data
*/

export function formatGetMutualFollowerData(result) {
    const userDataArray = [];
    const userList = result.getNotBlockedFollowingUsers;
    if (userList && Array.isArray(userList)) {
        userList.map((data, index) => {
            const actObj = {
                id: data.user.id,
                name: data.name.full
            };
            userDataArray.push(actObj);
        });
    }
    return userDataArray;
}

export function formateGetMessageListingResults(result) {
    const userMessageDataObject = {};
    const userMessage = [];
    const userMessageList = result.data.listingObject;
    if (userMessageList && Array.isArray(userMessageList)) {
        userMessageList.map((data, index) => {
            //Finding ramdo lat long
            if (data._id != '') {
                const actObj = {
                    _id: data._id,
                    isDeleted: data.isDeleted,
                    isArchived: data.isArchived,
                    id: data.userDetails.user.id,
                    name: data.userDetails.name.full,
                    lastMessage: data.lastMessage,
                    lastMessageDate: data.lastMessageDate,
                    media: data.userDetails.profileMedia ? data.userDetails.profileMedia : '',
                    chatDetails: data.chatDetails,
                    senderUserId: data.senderUserId,
                    receiverUserId: data.receiverUserId,
                    unreadMessageCount: data.unreadMessage,
                };
                userMessage.push(actObj);
            }
        });
        userMessageDataObject.userMessageList = userMessage;
    }
    return userMessageDataObject;
}

export function formatGetMessageDetails(result) {
    let userMessage = [];
    let userMessageDataObject = [];
    if (result && result !== undefined) {
        result.map((data, index) => {
            console.log('data: from us ', data);
            const actObj = {
                id: index,
                // id: data.receiverUserId,
                text: data.message,
                createdAt: new Date(data.messageDate),
                user: {
                    id: data.senderUserId,
                    name: data.name,

                    //avatar: this.props.user.avatar  , 
                    //'https://placeimg.com/140/140/any',
                },
                chatId: data._id
            }
            userMessage.push(actObj);
            console.log('actObj: ', actObj);
        });
        userMessageDataObject = userMessage;
    }
    return userMessageDataObject;
}

export function formatCreateResumeBuilderResult() {

    const newFormData = {
        profileImage: '',
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        birthDate: '',
        contactNumber: '',
        unionStatus: '',
        height: '',
        weight: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        aboutSummary: '',
        categories: [],
        appearance: [],
        sport: [],
        performance: [],
        links: [],
        award: [],
        languages: [],
        accents: [],
        disabilities: [],
        theatreExperiences: [],
        filmExperiences: [],
        tvExperiences: [],
        educationalTraining: []
    };
    return newFormData;
}