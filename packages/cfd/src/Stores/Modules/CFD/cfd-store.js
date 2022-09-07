import { action, computed, observable, reaction, runInAction } from 'mobx';
import { getAccountListKey, getAccountTypeFields, CFD_PLATFORMS, WS } from '@deriv/shared';
import BaseStore from 'Stores/base-store';
import { getDxCompanies, getMtCompanies } from './Helpers/cfd-config';

export default class CFDStore extends BaseStore {
    @observable is_compare_accounts_visible = false;
    @observable is_cfd_personal_details_modal_visible = false;
    @observable is_jurisdiction_modal_visible = false;
    @observable is_mt5_trade_modal_visible = false;
    @observable jurisdiction_selected_shortcode = '';

    @observable account_type = {
        category: undefined,
        type: undefined,
    };

    @observable mt5_trade_account = {};
    @observable new_account_response = {};
    @observable map_type = {};
    @observable has_cfd_error = false;
    @observable error_message = '';

    @observable is_cfd_success_dialog_enabled = false;
    @observable is_mt5_financial_stp_modal_open = false;
    @observable is_cfd_password_modal_enabled = false;
    @observable is_cfd_reset_password_modal_enabled = false;

    @observable current_account = undefined; // this is a tmp value, don't rely on it, unless you set it first.

    @observable error_type = undefined;

    @observable is_cfd_verification_modal_visible = false;
    @observable dxtrade_tokens = {
        demo: '',
        real: '',
    };

    real_synthetic_accounts_existing_data = [];
    real_financial_accounts_existing_data = [];

    constructor({ root_store }) {
        super({ root_store });

        reaction(
            () => [this.root_store.client.dxtrade_accounts_list],
            () => {
                if (this.root_store.client.dxtrade_accounts_list.length > 0) {
                    this.loadDxtradeTokens();
                }
            }
        );
    }

    @computed
    get account_title() {
        return this.account_type.category
            ? getMtCompanies(this.root_store.client.is_eu)[this.account_type.category][this.account_type.type].title
            : '';
    }

    @computed
    get current_list() {
        const list = {};

        this.root_store.client.mt5_login_list.forEach(account => {
            // e.g. mt5.real.financial_stp
            list[getAccountListKey(account, CFD_PLATFORMS.MT5, account.landing_company_short)] = {
                ...account,
            };
        });

        this.root_store.client.dxtrade_accounts_list.forEach(account => {
            // e.g. dxtrade.real.financial_stp
            list[getAccountListKey(account, CFD_PLATFORMS.DXTRADE)] = {
                ...account,
            };
        });

        return list;
    }

    // eslint-disable-next-line class-methods-use-this
    get mt5_companies() {
        return getMtCompanies(this.root_store.client.is_eu);
    }

    // eslint-disable-next-line class-methods-use-this
    get dxtrade_companies() {
        return getDxCompanies();
    }

    @action.bound
    onMount() {
        this.checkShouldOpenAccount();
        this.onRealAccountSignupEnd(this.realAccountSignupEndListener);
        this.root_store.ui.is_cfd_page = true;
    }

    @action.bound
    onUnmount() {
        this.disposeRealAccountSignupEnd();
        this.root_store.ui.is_cfd_page = false;
    }

    // other platforms can redirect to here using account switcher's `Add` account button
    // so in that case we should open the corresponding account opening modal on load/component update
    @action.bound
    checkShouldOpenAccount() {
        const account_type = sessionStorage.getItem('open_cfd_account_type');
        if (account_type) {
            const [category, platform, type, set_password] = account_type.split('.');
            this.createCFDAccount({ category, platform, type, set_password });
            sessionStorage.removeItem('open_cfd_account_type');
        }
    }

    @action.bound
    realAccountSignupEndListener() {
        const post_signup = JSON.parse(sessionStorage.getItem('post_real_account_signup'));
        if (post_signup && post_signup.category && post_signup.type) {
            sessionStorage.removeItem('post_real_account_signup');
            this.enableCFDPasswordModal();
        }
        return Promise.resolve();
    }

    @action.bound
    resetFormErrors() {
        this.error_message = '';
        this.error_type = undefined;
        this.has_cfd_error = false;
    }

    @action.bound
    clearCFDError() {
        this.resetFormErrors();
        this.is_cfd_password_modal_enabled = false;
    }

    @action.bound
    createCFDAccount({ category, platform, type, set_password }) {
        this.clearCFDError();
        this.setAccountType({
            category,
            type,
        });
        if (platform === CFD_PLATFORMS.DXTRADE) {
            if (category === 'real') {
                this.realCFDSignup(set_password);
            } else {
                this.demoCFDSignup();
            }
        } else if (platform === CFD_PLATFORMS.MT5) {
            if (category === 'real') {
                this.toggleJurisdictionModal();
            } else {
                if (this.root_store.client.is_eu) {
                    this.setJurisdictionSelectedShortcode('maltainvest');
                } else this.setJurisdictionSelectedShortcode('svg');
                this.demoCFDSignup();
            }
        }
    }

    demoCFDSignup() {
        this.enableCFDPasswordModal();
    }

    @action.bound
    disableCFDPasswordModal() {
        this.is_cfd_password_modal_enabled = false;
    }

    @action.bound
    enableCFDPasswordModal() {
        this.is_cfd_password_modal_enabled = true;
    }

    @action.bound
    getName() {
        const { first_name } = this.root_store.client.account_settings && this.root_store.client.account_settings;
        const title = this.mt5_companies[this.account_type.category][this.account_type.type].title;

        // First name is not set when user has no real account
        return first_name ? [first_name, title].join(' ') : title;
    }

    @action.bound
    openMT5Account(values) {
        const name = this.getName();
        const leverage = this.mt5_companies[this.account_type.category][this.account_type.type].leverage;
        const type_request = getAccountTypeFields(this.account_type);
        const { address_line_1, address_line_2, address_postcode, address_city, address_state, country_code, phone } =
            this.root_store.client.account_settings;

        return WS.mt5NewAccount({
            mainPassword: values.password,
            email: this.root_store.client.email_address,
            leverage,
            name,
            address: address_line_1 || address_line_2,
            city: address_city,
            country: country_code,
            phone,
            state: address_state,
            zipCode: address_postcode,
            ...(values.server ? { server: values.server } : {}),
            ...(this.jurisdiction_selected_shortcode ? { company: this.jurisdiction_selected_shortcode } : {}),
            ...(this.jurisdiction_selected_shortcode !== 'labuan'
                ? type_request
                : {
                      account_type: 'financial',
                      mt5_account_type: 'financial_stp',
                  }),
        });
    }

    @action.bound
    openCFDAccount(values) {
        return WS.tradingPlatformNewAccount({
            password: values.password,
            platform: values.platform,
            account_type: this.account_type.category,
            market_type: this.account_type.type,
        });
    }

    @action.bound
    beginRealSignupForMt5() {
        sessionStorage.setItem('post_real_account_signup', JSON.stringify(this.account_type));
        this.root_store.ui.openRealAccountSignup();
    }

    realCFDSignup(set_password) {
        switch (this.account_type.type) {
            case 'financial':
                this.enableCFDPasswordModal();
                break;
            case 'financial_stp':
                this.root_store.client.fetchResidenceList();
                this.root_store.client.fetchStatesList();
                this.root_store.client.fetchAccountSettings();
                if (set_password) this.enableCFDPasswordModal();
                else this.enableMt5FinancialStpModal();
                break;
            case 'synthetic':
                this.enableCFDPasswordModal();
                break;
            default:
                throw new Error('Cannot determine mt5 account signup.');
        }
    }

    @action.bound
    enableMt5FinancialStpModal() {
        this.is_mt5_financial_stp_modal_open = true;
    }

    @action.bound
    setAccountType(account_type) {
        this.account_type = account_type;
    }

    @action.bound
    setCurrentAccount(data, meta) {
        this.current_account = {
            ...meta,
            ...data,
        };
    }

    @action.bound
    setMT5TradeAccount(mt5_trade_account) {
        this.mt5_trade_account = mt5_trade_account;
    }

    @action.bound
    setError(state, obj) {
        this.has_cfd_error = state;
        this.error_message = obj ? obj.message : '';
        this.error_type = obj?.code ?? undefined;
    }

    @action.bound
    setCFDNewAccount(cfd_new_account) {
        this.new_account_response = cfd_new_account;
    }

    @action.bound
    setCFDSuccessDialog(value) {
        this.is_cfd_success_dialog_enabled = !!value;
    }

    @action.bound
    storeProofOfAddress(file_uploader_ref, values, { setStatus }) {
        return new Promise((resolve, reject) => {
            setStatus({ msg: '' });
            this.setState({ is_btn_loading: true });

            WS.setSettings(values).then(data => {
                if (data.error) {
                    setStatus({ msg: data.error.message });
                    reject(data);
                } else {
                    this.root_store.fetchAccountSettings();
                    // force request to update settings cache since settings have been updated
                    file_uploader_ref.current.upload().then(api_response => {
                        if (api_response.warning) {
                            setStatus({ msg: api_response.message });
                            reject(api_response);
                        } else {
                            WS.authorized.storage.getAccountStatus().then(({ error, get_account_status }) => {
                                if (error) {
                                    reject(error);
                                }
                                const { identity } = get_account_status.authentication;
                                const has_poi = !(identity && identity.status === 'none');
                                resolve({
                                    identity,
                                    has_poi,
                                });
                            });
                        }
                    });
                }
            });
        });
    }

    @action.bound
    async getAccountStatus(platform) {
        const should_load_account_status =
            (platform === CFD_PLATFORMS.MT5 && this.root_store.client.is_mt5_password_not_set) ||
            (platform === CFD_PLATFORMS.DXTRADE && this.root_store.client.is_dxtrade_password_not_set);

        if (should_load_account_status) {
            await WS.getAccountStatus();
        }
    }

    @action.bound
    async creatMT5Password(values, actions) {
        const response = await WS.tradingPlatformPasswordChange({
            new_password: values.password,
            platform: CFD_PLATFORMS.MT5,
        });
        if (response.error) {
            this.setError(true, response.error);
            actions.resetForm({});
            actions.setSubmitting(false);
            actions.setStatus({ success: false });
            return true;
        }
        return false;
    }

    @action.bound
    async submitMt5Password(values, actions) {
        if (this.root_store.client.is_mt5_password_not_set) {
            const has_error = await this.creatMT5Password(values, actions);
            if (has_error) return;
        }

        this.resetFormErrors();
        const response = await this.openMT5Account(values);
        if (!response.error) {
            actions.setStatus({ success: true });
            actions.setSubmitting(false);
            this.setError(false);
            this.setCFDSuccessDialog(true);
            await this.getAccountStatus(CFD_PLATFORMS.MT5);

            const mt5_login_list_response = await WS.authorized.mt5LoginList();
            this.root_store.client.responseMt5LoginList(mt5_login_list_response);

            WS.transferBetweenAccounts(); // get the list of updated accounts for transfer in cashier
            this.root_store.client.responseMT5TradingServers(await WS.tradingServers(CFD_PLATFORMS.MT5));
            this.setCFDNewAccount(response.mt5_new_account);
        } else {
            await this.getAccountStatus(CFD_PLATFORMS.MT5);
            this.setError(true, response.error);
            actions.resetForm({});
            actions.setSubmitting(false);
            actions.setStatus({ success: false });
        }
    }

    @action.bound
    async createCFDPassword(values, actions) {
        const response = await WS.tradingPlatformPasswordChange({
            new_password: values.password,
            platform: CFD_PLATFORMS.DXTRADE,
        });
        if (response.error) {
            this.setError(true, response.error);
            actions.resetForm({});
            actions.setSubmitting(false);
            actions.setStatus({ success: false });
            return true;
        }

        return false;
    }

    @action.bound
    async submitCFDPassword(values, actions) {
        if (this.root_store.client.is_dxtrade_password_not_set) {
            const has_error = await this.createCFDPassword(values, actions);
            if (has_error) return;
        }

        const response = await this.openCFDAccount(values);
        if (!response.error) {
            actions.setStatus({ success: true });
            actions.setSubmitting(false);
            this.setError(false);
            this.setCFDSuccessDialog(true);
            await this.getAccountStatus(CFD_PLATFORMS.DXTRADE);

            const trading_platform_accounts_list_response = await WS.tradingPlatformAccountsList(values.platform);
            this.root_store.client.responseTradingPlatformAccountsList(trading_platform_accounts_list_response);

            WS.transferBetweenAccounts(); // get the list of updated accounts for transfer in cashier
            this.setCFDNewAccount(response.trading_platform_new_account);
        } else {
            await this.getAccountStatus(CFD_PLATFORMS.DXTRADE);
            this.setError(true, response.error);
            actions.resetForm({});
            actions.setSubmitting(false);
            actions.setStatus({ success: false });
        }
    }

    @action.bound
    toggleCompareAccountsModal() {
        this.is_compare_accounts_visible = !this.is_compare_accounts_visible;
    }

    @action.bound
    getRealSyntheticAccountsExistingData(real_synthetic_accounts_existing_data) {
        this.real_synthetic_accounts_existing_data = real_synthetic_accounts_existing_data;
    }

    @action.bound
    getRealFinancialAccountsExistingData(real_financial_accounts_existing_data) {
        this.real_financial_accounts_existing_data = real_financial_accounts_existing_data;
    }

    @action.bound
    toggleJurisdictionModal() {
        this.is_jurisdiction_modal_visible = !this.is_jurisdiction_modal_visible;
    }

    @action.bound
    toggleMT5TradeModal() {
        this.is_mt5_trade_modal_visible = !this.is_mt5_trade_modal_visible;
    }

    @action.bound
    disableMt5FinancialStpModal() {
        this.is_mt5_financial_stp_modal_open = false;
    }

    @action.bound
    async topUpVirtual(platform) {
        this.root_store.ui.setTopUpInProgress(true);
        let response;

        switch (platform) {
            case CFD_PLATFORMS.DXTRADE: {
                response = await WS.authorized.send({
                    trading_platform_deposit: 1,
                    platform: CFD_PLATFORMS.DXTRADE,
                    to_account: this.current_account.account_id,
                });
                break;
            }
            case CFD_PLATFORMS.MT5: {
                response = await WS.authorized.mt5Deposit({
                    to_mt5: this.current_account.login,
                });
                break;
            }
            default: {
                response.error = 'Invalid platform';
                break;
            }
        }

        if (!response.error) {
            let new_balance;
            switch (platform) {
                case CFD_PLATFORMS.DXTRADE: {
                    await WS.authorized
                        .tradingPlatformAccountsList(CFD_PLATFORMS.DXTRADE)
                        .then(this.root_store.client.responseTradingPlatformAccountsList);
                    new_balance = this.root_store.client.dxtrade_accounts_list.find(
                        item => item.account_id === this.current_account.account_id
                    )?.balance;
                    break;
                }
                case CFD_PLATFORMS.MT5: {
                    await WS.authorized.mt5LoginList().then(this.root_store.client.responseMt5LoginList);

                    new_balance = this.root_store.client.mt5_login_list.find(
                        item => item.login === this.current_account.login
                    )?.balance;
                    break;
                }
                default: {
                    break;
                }
            }
            runInAction(() => {
                // Get new current account
                this.root_store.ui.is_top_up_virtual_open = false;
                this.current_account.balance = new_balance;
            });
            setTimeout(() => {
                runInAction(() => {
                    this.root_store.ui.is_top_up_virtual_success = true;
                });
            }, 250);
        } else {
            // eslint-disable-next-line no-console
            console.error(response);
        }
        this.root_store.ui.setTopUpInProgress(false);
    }

    @action.bound
    sendVerifyEmail() {
        return WS.verifyEmail(this.root_store.client.email, 'trading_platform_investor_password_reset');
    }

    @action.bound
    setCFDPasswordResetModal(val) {
        this.is_cfd_reset_password_modal_enabled = !!val;
    }

    @action.bound
    setDxtradeToken(response, server) {
        if (!response.error) {
            const { dxtrade } = response.service_token;
            this.dxtrade_tokens[server] = dxtrade.token;
        }
    }

    @action.bound
    loadDxtradeTokens() {
        ['demo', 'real'].forEach(account_type => {
            const has_existing_account = this.root_store.client.dxtrade_accounts_list.some(
                account => account.account_type === account_type
            );

            if (!this.dxtrade_tokens[account_type] && has_existing_account) {
                WS.getServiceToken(CFD_PLATFORMS.DXTRADE, account_type).then(response =>
                    this.setDxtradeToken(response, account_type)
                );
            }
        });
    }

    @action.bound
    toggleCFDPersonalDetailsModal() {
        this.is_cfd_personal_details_modal_visible = !this.is_cfd_personal_details_modal_visible;
    }

    static async changePassword({ login, old_password, new_password, password_type }) {
        let response;

        if (password_type === 'investor') {
            response = await WS.authorized.tradingPlatformInvestorPasswordChange({
                account_id: login,
                old_password,
                new_password,
                platform: CFD_PLATFORMS.MT5,
            });
        } else {
            response = await WS.authorized.tradingPlatformPasswordChange({
                account_id: login,
                old_password,
                new_password,
                platform: CFD_PLATFORMS.MT5,
            });
        }

        return response?.error?.message;
    }

    @action.bound
    setJurisdictionSelectedShortcode(shortcode) {
        this.jurisdiction_selected_shortcode = shortcode;
    }

    @action.bound
    toggleCFDVerificationModal() {
        this.is_cfd_verification_modal_visible = !this.is_cfd_verification_modal_visible;
    }
}
