import { History } from 'history';
import { DetailsOfEachMT5Loginid, VerifyEmailResponse } from '@deriv/api-types';
import { FormikHelpers as FormikActions } from 'formik';
import { TCFDPasswordFormValues } from './cfd-password-modal';

type CFD_Platform = 'dxtrade' | 'mt5';

export type TCFDChangePasswordConfirmationProps = {
    confirm_label?: string;
    platform: string;
    className?: string;
    onConfirm: (values: TCFDPasswordFormValues, actions: FormikActions<TCFDPasswordFormValues>) => void;
    onCancel: () => void;
};

export type TCFDDashboardContainer = {
    platform: CFD_Platform;
    active_index: number;
    is_dark_mode_on: boolean;
};

export type TMT5AccountOpeningRealFinancialStpModal = {
    enableApp: () => void;
    disableApp: () => void;
    disableMt5FinancialStpModal: () => void;
    is_mt5_financial_stp_modal_open: boolean;
};

export type TMissingRealAccount = {
    onClickSignup: () => void;
    platform: CFD_Platform;
};

export type TChangePassword = {
    platform: string;
    onConfirm: () => void;
};

export type TPasswordResetAndTradingPasswordManager = {
    email: string;
    platform: CFD_Platform;
    account_group: 'real' | 'demo';
    toggleModal?: () => void;
};

export type TResetPasswordIntent = {
    current_list: Array<DetailsOfEachMT5Loginid> & Record<string, DetailsOfEachMT5Loginid>;
    children({ ...props }): React.ReactElement;
    is_eu: boolean;
};

export type TError = {
    code: string | number;
    message: string;
};

export type TCFDResetPasswordModal = {
    current_list: Array<DetailsOfEachMT5Loginid> & Record<string, DetailsOfEachMT5Loginid>;
    email: string;
    is_cfd_reset_password_modal_enabled: boolean;
    is_eu: boolean;
    is_logged_in: boolean;
    platform: CFD_Platform;
    setCFDPasswordResetModal: (value: boolean) => void;
    history: History;
};

export type TCFDPasswordSuccessMessage = {
    toggleModal: () => void;
    is_investor: boolean;
};

export type TFormValues = Record<'old_password' | 'new_password' | 'password_type', string>;

export type TPasswordManagerModalFormValues = Record<'old_password' | 'new_password' | 'password_type', string>;

export type TMultiStepRefProps = {
    goNextStep: () => void;
    goPrevStep: () => void;
};

export type TInvestorPasswordManager = {
    error_message_investor: string;
    is_submit_success_investor: boolean;
    multi_step_ref: React.MutableRefObject<TMultiStepRefProps | undefined>;
    onSubmit: (values: TPasswordManagerModalFormValues) => Promise<void>;
    setPasswordType: (value: string) => void;
    toggleModal: () => void;
    validatePassword: (values: { old_password: string; new_password: string; password_type: string }) => void | object;
};

export type TCountdownComponent = {
    count_from: number;
    onTimeout: () => void;
};

export type TCFDPasswordReset = {
    sendVerifyEmail: () => Promise<VerifyEmailResponse>;
    account_type: string;
    account_group: 'real' | 'demo';
    server: string;
    password_type: string;
};

export type TCFDPasswordManagerTabContentWrapper = {
    multi_step_ref: React.MutableRefObject<TMultiStepRefProps | undefined>;
    steps: Array<{ component: JSX.Element }>;
};

export type TCFDPasswordManagerTabContent = {
    toggleModal: () => void;
    selected_login: string;
    email: string;
    setPasswordType: (value: string) => void;
    multi_step_ref: React.MutableRefObject<TMultiStepRefProps | undefined>;
    platform: CFD_Platform;
    onChangeActiveTabIndex: (value: number) => void;
    account_group: 'real' | 'demo';
};

export type TCFDPasswordManagerModal = {
    enableApp: () => void;
    email: string;
    disableApp: () => void;
    is_visible: boolean;
    platform: CFD_Platform;
    selected_login: string;
    selected_account: string;
    toggleModal: () => void;
    selected_account_type: string;
    selected_account_group: 'real' | 'demo';
    selected_server: string;
    sendVerifyEmail: () => Promise<VerifyEmailResponse>;
};
