export const showcaseTableMainButton = (AddAccessibility, BulkUploadAccessibility, DownloadAccessibility) => {
    const mainButtonArr = [];
    AddAccessibility && mainButtonArr.push('Add');
    BulkUploadAccessibility && mainButtonArr.push('Upload');
    DownloadAccessibility && mainButtonArr.push('Download');
    return mainButtonArr;
}