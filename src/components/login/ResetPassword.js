import React from 'react'
import logoutImg from '../../assests/images/logout.svg'
//MINDA
import { Nav } from 'reactstrap'
import { PasswordFieldHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'
import { IVRFQ, KEYRFQ, RESET_PASSWORD, VERSION } from '../../config/constants'
import { required, minLength6, maxLength18, checkWhiteSpaces, strongPassword } from "../../helper/validation";
import { useHistory, useLocation } from 'react-router-dom'
import { reactLocalStorage } from 'reactjs-localstorage'
import { useEffect } from 'react'
import PopupMsgWrapper from '../common/PopupMsgWrapper'
import { useDispatch } from 'react-redux'
import { updatePassword } from '../../actions/auth/AuthActions'
import Toaster from '../common/Toaster'
import { CirLogo, CompanyLogo } from '../../helper/core'

const CryptoJS = require('crypto-js')
function ResetPassword() {
    const [isShowHidePassword, setIsShowHidePassword] = useState(false);
    const [isShowHide, setIsShowHide] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors }, control, getValues } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { search, pathname } = useLocation();
    const searchParams = new URLSearchParams(search);
    const userId = searchParams.get('ForgetAndResetPasswordId');
    const userName = searchParams.get('userName');
    useEffect(() => {
        reactLocalStorage.setObject('isUserLoggedIn', false)
    }, [])
    const passwordPatternHandler = (e) => {
        const value = e.target.value;
        const input = value;
        var number = input.split("");


    };

    const showHideHandler = () => {
        setIsShowHide(!isShowHide)
    }

    const showHidePasswordHandler = () => {
        setIsShowHidePassword(!isShowHidePassword)
    }

    const checkPasswordConfirm = value => {
        let pass = getValues('Password')
        return value && (value != pass) ? "Password and confirm password do not match." : undefined
    }
    const submit = (values) => {
        let key, iv;
        key = CryptoJS.enc.Utf8.parse(KEYRFQ);
        iv = CryptoJS.enc.Utf8.parse(IVRFQ);
        var encryptedpassword = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(values?.Password), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        let requestData = {
            ForgetAndResetPasswordId: userId,
            password: encryptedpassword.toString(),
            IsResetPassword: pathname === RESET_PASSWORD ? true : false,
            IsForgetPassword: pathname === RESET_PASSWORD ? false : true
        }
        dispatch(updatePassword(requestData, (res) => {
            if (res && res.status === 200) {
                history.push('/login')
                Toaster.success("Your password has been reset successfully. Please use your new credentials to log in.")
            }
        }))

    }

    const onPopupConfirm = (e) => {
        setShowPopup(false)
        history.push('/login')
    }
    const closePopUp = () => {
        setShowPopup(false)
    }
    return (
        <div className='reset-wrapper'>
            <nav className="navbar navbar-expand-lg fixed-top nav bg-light">
                <div className="logo-container">
                    <button className="btn btn-no-border">
                        <CompanyLogo height="40" />
                    </button>
                    <div className="border-left"></div>
                    <div className="btn btn-no-border rfq-icon-container d-flex align-items-center" >
                        <CirLogo height="40" />
                    </div>
                </div>
                <div className="navbar-collapse offcanvas-collapse justify-content-end" id="">
                    <ul className="navbar-nav ml-auto align-items-center">
                        <li className="nav-item d-xl-inline-block version">
                            {VERSION}
                        </li>
                        <li className="nav-item d-xl-inline-block user-border-left">
                            <div className="nav-link-user">
                                <Nav className="ml-auto top-menu logout d-inline-flex">
                                    <div className="user-name">{userName}</div>
                                </Nav>
                            </div>
                        </li>
                        {/* <li className="d-xl-inline-block ml-2 p-relative">
                            <button className="btn btn-no-border" onClick={() => setShowPopup(true)} title='Exit'>
                                <img
                                    className=""
                                    src={logoutImg}
                                    alt="logout"
                                />
                            </button>
                        </li> */}
                    </ul>
                </div>
            </nav>

            <div className='reset-container'>
                <form onSubmit={handleSubmit(submit)} className='inner-container'>
                    <div className='d-flex justify-content-center mb-3'>
                        <div className='lock-icon'></div>
                    </div>
                    <h3 className='text-center font-weight- mb-3'>Change Your Password</h3>
                    <div id="password" className="input-group password password-wrapper mb-5">
                        <PasswordFieldHookForm
                            name="Password"
                            label="New Password"
                            placeholder="Enter"
                            disableErrorOverflow={true}
                            errors={errors.Password}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}

                            handleChange={passwordPatternHandler}
                            //component={renderPasswordInputField}
                            //onChange={passwordPatternHandler}
                            //validate={[required, minLength6, maxLength18, checkWhiteSpaces, strongPassword]}
                            rules={{
                                required: true,
                                validate: { required, minLength6, maxLength18, checkWhiteSpaces, strongPassword }
                            }}
                            isShowHide={isShowHidePassword}
                            showHide={showHidePasswordHandler}
                            // maxLength={26}
                            isEyeIcon={true}
                            autoComplete={"new-password"}
                            customClassName={'withBorderPWD mb-0'}
                        />
                    </div>
                    <div className="input-group password-wrapper mb-5">
                        <PasswordFieldHookForm
                            name="passwordConfirm"
                            label="Confirm Password"
                            placeholder={'Enter'}
                            errors={errors.passwordConfirm}
                            Controller={Controller}
                            control={control}
                            register={register}
                            onPaste={(e) => e.preventDefault()}
                            mandatory={true}
                            disableErrorOverflow={true}
                            rules={{
                                required: true,
                                validate: { required, minLength6, maxLength18, checkWhiteSpaces, checkPasswordConfirm }
                            }}
                            //component={renderPasswordInputField}
                            //validate={[required, minLength6, maxLength18, checkWhiteSpaces]}
                            // maxLength={26}
                            isShowHide={isShowHide}
                            showHide={showHideHandler}
                            isEyeIcon={true}
                            customClassName={'withBorderPWD mb-0'}
                            handleChange={() => { }}
                        />
                    </div>
                    <div className='text-center'>
                        <button className='user-btn' type='submit'>Submit</button>
                    </div>
                    <div className='text-center'>
                        <span id="backToLogin" className="btn btn-link" onClick={onPopupConfirm}>{'Back to login'}</span>
                    </div>
                </form>

            </div>
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Are you sure do you want to exit?`} />
            }
        </div>
    )
}

export default ResetPassword