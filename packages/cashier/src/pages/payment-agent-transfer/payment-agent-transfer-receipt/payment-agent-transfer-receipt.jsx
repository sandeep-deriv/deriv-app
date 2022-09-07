import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import { Button, Icon, Text } from '@deriv/components';
import { routes, formatMoney, getCurrencyDisplayCode, getCurrencyName } from '@deriv/shared';
import { localize, Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import './payment-agent-transfer-receipt.scss';

const openStatement = (history, resetPaymentAgentTransfer) => {
    history.push(routes.statement);
    resetPaymentAgentTransfer();
};

const PaymentAgentTransferReceipt = ({
    currency,
    history,
    is_from_derivgo,
    loginid,
    receipt,
    resetPaymentAgentTransfer,
}) => (
    <div className='cashier__wrapper payment-agent-transfer-receipt__wrapper'>
        <div className='cashier__success'>
            <Text as='h2' color='prominent' align='center' weight='bold' className='cashier__header'>
                <Localize i18n_default_text="You've transferred" />{' '}
                {formatMoney(currency, receipt.amount_transferred, true)} {getCurrencyDisplayCode(currency)}
            </Text>
            <div className='cashier__transferred-details-wrapper'>
                <span className='account-transfer__transfer-details-from'>
                    <Icon icon={`IcCurrency-${currency.toLowerCase()}`} />
                    <span className='cashier__transferred-details'>
                        <Text size='xs' line_height='xs' weight='bold'>
                            {getCurrencyName(currency)}
                        </Text>
                        <Text size='xs' line_height='xs' color='less-prominent'>
                            {loginid}
                        </Text>
                    </span>
                </span>
                <Icon className='cashier__transferred-icon' icon='IcArrowLeftBold' />
                <span className='account-transfer__transfer-details-to'>
                    <Icon icon='IcCashierPaymentAgent' />
                    <span className='cashier__transferred-details'>
                        <Text size='xs' line_height='xs' weight='bold'>
                            {receipt.client_name}
                        </Text>
                        <Text size='xs' line_height='xs' color='less-prominent'>
                            {receipt.client_id.toUpperCase()}
                        </Text>
                    </span>
                </span>
            </div>
        </div>
        <div className='cashier__form-submit'>
            {!is_from_derivgo && (
                <Button
                    className='cashier__form-submit-button'
                    has_effect
                    text={localize('View transactions')}
                    onClick={() => openStatement(history, resetPaymentAgentTransfer)}
                    secondary
                    large
                />
            )}
            <Button
                className='cashier__form-submit-button cashier__done-button'
                has_effect
                text={localize('Make a new transfer')}
                onClick={resetPaymentAgentTransfer}
                primary
                large
            />
        </div>
    </div>
);

PaymentAgentTransferReceipt.propTypes = {
    currency: PropTypes.string,
    history: PropTypes.object,
    is_from_derivgo: PropTypes.bool,
    loginid: PropTypes.string,
    receipt: PropTypes.object,
    resetPaymentAgentTransfer: PropTypes.func,
};

export default withRouter(
    connect(({ client, common, modules }) => ({
        currency: client.currency,
        is_from_derivgo: common.is_from_derivgo,
        loginid: client.loginid,
        receipt: modules.cashier.payment_agent_transfer.receipt,
        resetPaymentAgentTransfer: modules.cashier.payment_agent_transfer.resetPaymentAgentTransfer,
    }))(PaymentAgentTransferReceipt)
);
