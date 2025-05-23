import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { useForm, Controller } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { acceptAllExceptSingleSpecialCharacter, checkSpacesInString, checkWhiteSpaces, maxLength80, maxLength512, required } from '../../../helper';
import { TextFieldHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { addPartFamily, editPartFamily, getPartFamilyById } from '../actions/Part';
import { loggedInUserId } from "../../../helper/auth";
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';
import { useLabels } from '../../../helper/core';
import { useTranslation } from 'react-i18next';

const PartFamilyDrawer = (props) => {
  const { isOpen, anchor = 'right', onClose, isEditFlag, isViewFlag, ID, refreshFamilyList } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [partFamilyData, setPartFamilyData] = useState(null);
  const dispatch = useDispatch();
  const { t } = useTranslation(['PartMaster', 'CommonLabels']);
  
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Fetch part family data when in edit mode or view mode
  useEffect(() => {
    if ((isEditFlag || isViewFlag) && ID) {
      setIsLoading(true);
      dispatch(getPartFamilyById(ID, (res) => {
        setIsLoading(false);
        if (res && res.data && res.data.Result) {
          const data = res.data.Data;
          setPartFamilyData(data);
          
          // Set form values from API data
          setValue('PartFamilyCode', data.PartFamilyCode || '');
          setValue('PartFamilyName', data.PartFamilyName || '');
          setValue('Remarks', data.Description || '');
        } else {
          Toaster.error(t('CommonLabels:errorFetchingData', 'Error fetching part family data'));
        }
      }));
    }
  }, [isEditFlag, isViewFlag, ID, dispatch, setValue, t]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  const onSubmit = (values) => {
    if (isViewFlag) {
      handleCancel();
      return;
    }
    
    if (!values?.PartFamilyCode || !values?.PartFamilyName) {
      Toaster.warning(t('CommonLabels:requiredFieldsMessage', 'Please fill all required fields'));
      return;
    }
    
    setIsSubmitting(true);
    
    if (isEditFlag) {
      const updateData = {
        PartFamilyId: ID,
        PartFamilyCode: values?.PartFamilyCode,
        PartFamilyName: values?.PartFamilyName,
        Description: values?.Remarks || '',
        LoggedInUserId: loggedInUserId(),
      };
      
      dispatch(editPartFamily(updateData, (res) => {
        setIsSubmitting(false);
        if (res && res.data && res.data.Result) {
          Toaster.success(t('PartMaster:familyUpdateSuccess', 'Part family updated successfully'));
          if (refreshFamilyList) refreshFamilyList();
          if (onClose) onClose();
        }
      }));
    } else {
      const addData = {
        PartFamilyCode: values?.PartFamilyCode,
        PartFamilyName: values?.PartFamilyName,
        Description: values?.Remarks || '',
        LoggedInUserId: loggedInUserId(),
        RecordCreatedBy: ''
      };
      
      dispatch(addPartFamily(addData, (res) => {
        setIsSubmitting(false);
        if (res && res.data && res.data.Result) {
          Toaster.success(t('PartMaster:familyAddSuccess', 'Part family added successfully'));
          if (refreshFamilyList) refreshFamilyList();
          if (onClose) onClose();
        }
      }));
    }
  };

  return (
    <Drawer anchor={anchor} open={isOpen} onClose={onClose}>
      <Container>
        <div className="drawer-wrapper">
          {(isSubmitting || isLoading) && <LoaderCustom />}
          <form
            noValidate
            className="form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
          >
            <Row className="drawer-heading">
              <Col>
                <div className="header-wrapper left">
                  <h3>{isViewFlag
                    ? t('PartMaster:viewPartFamily', 'View Part Family')
                    : isEditFlag 
                      ? t('PartMaster:updatePartFamily', 'Update Part Family')
                      : t('PartMaster:addPartFamily', 'Add Part Family')}
                  </h3>
                </div>
                <div
                  onClick={handleCancel}
                  className="close-button right"
                ></div>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <TextFieldHookForm
                  label={t('PartMaster:partFamilyCode', 'Part Family Code')}
                  name="PartFamilyCode"
                  Controller={Controller}
                  control={control}
                  register={register}
                  placeholder={t('CommonLabels:enter', 'Enter')}
                  rules={{
                    required: true, 
                    validate: { 
                      acceptAllExceptSingleSpecialCharacter, 
                      checkWhiteSpaces, 
                      maxLength80, 
                      checkSpacesInString 
                    }
                  }}
                  mandatory={true}
                  errors={errors.PartFamilyCode}
                  handleChange={() => {}}
                  customClassName="withBorder"
                  disabled={isViewFlag}
                />
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <TextFieldHookForm
                  label={t('PartMaster:partFamilyName', 'Part Family Name')}
                  name="PartFamilyName"
                  Controller={Controller}
                  control={control}
                  register={register}
                  placeholder={t('CommonLabels:enter', 'Enter')}
                  rules={{
                    required: true, 
                    validate: { 
                      acceptAllExceptSingleSpecialCharacter, 
                      checkWhiteSpaces, 
                      maxLength80, 
                      checkSpacesInString 
                    }
                  }}
                  mandatory={true}
                  errors={errors.PartFamilyName}
                  handleChange={() => {}}
                  customClassName="withBorder"
                  disabled={isViewFlag}
                />
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <TextAreaHookForm
                  label={t('CommonLabels:remarks', 'Remarks')}
                  name="Remarks"
                  Controller={Controller}
                  control={control}
                  register={register}
                  rowHeight={4}
                  mandatory={false}
                  rules={{
                    validate: { 
                      maxLength512, 
                      acceptAllExceptSingleSpecialCharacter 
                    },
                    maxLength: {
                      value: 500,
                      message: t('CommonLabels:remarkLengthError', 'Remark should be less than 500 words')
                    },
                  }}
                  handleChange={() => {}}
                  defaultValue=""
                  customClassName="textAreaWithBorder"
                  errors={errors.Remarks}
                  disabled={isViewFlag}
                />
              </Col>
            </Row>
            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-md-12 pl-3 pr-3">
                <div className="text-right">
                  <Button
                    onClick={handleCancel}
                    variant="mr15 cancel-btn"
                    icon="cancel-icon"
                    buttonName={isViewFlag 
                      ? t('CommonLabels:close', 'Close') 
                      : t('CommonLabels:cancel', 'Cancel')}
                  />
                  {!isViewFlag && (
                    <Button
                      type="submit"
                      className="save-btn"
                      icon="save-icon"
                      buttonName={isEditFlag 
                        ? t('CommonLabels:update', 'Update') 
                        : t('CommonLabels:save', 'Save')}
                      disabled={isSubmitting || isLoading}
                    />
                  )}
                </div>
              </div>
            </Row>
          </form>
        </div>
      </Container>
    </Drawer>
  );
};

export default PartFamilyDrawer;