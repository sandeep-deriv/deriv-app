import classnames from 'classnames';
import React from 'react';
import { Icon } from '@deriv/components';
import { localize, Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import RecentWorkspace from './recent-workspace';
import RootStore from 'Stores/index';
import DeleteDialog from './delete-dialog';
import { getSavedWorkspaces } from '@deriv/bot-skeleton';
import './index.scss';

type TRecentComponent = {
    is_explanation_expand: boolean;
    recent_strategies: [];
    toggleExplanationExpand: boolean;
    toggleStrategies: (param: boolean) => void;
};
const explanation_list = [
    localize('1. Logged in from a different device'),
    localize('2. Logged in from a different browser'),
    localize('3. Cleared your browser cache'),
];

const RecentComponent = ({
    is_explanation_expand,
    recent_strategies,
    toggleExplanationExpand,
    toggleStrategies,
}: TRecentComponent) => {
    const [get_strategies, setStrategies] = React.useState([]);

    React.useEffect(() => {
        toggleStrategies(true);
        getSavedWorkspaces().then(load_recent_strategies => {
            setStrategies(load_recent_strategies);
        });
    }, [recent_strategies]);

    if (get_strategies?.length) {
        return (
            <div className='load-strategy__container load-strategy__container--has-footer'>
                <div className='load-strategy__recent'>
                    <div className='load-strategy__recent__files'>
                        <div className='load-strategy__title'>
                            <Localize i18n_default_text='Your Bots' />
                        </div>
                        <div className='load-strategy__recent__files__list'>
                            {get_strategies.map((workspace, index) => {
                                return <RecentWorkspace key={workspace.id} workspace={workspace} index={index} />;
                            })}
                        </div>
                        <DeleteDialog setStrategies={setStrategies} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='load-strategy__container'>
            <div className='load-strategy__recent__empty'>
                <Icon icon='IcEmptyFolder' className='load-strategy__recent__empty-icon' size={128} />
                <div className='load-strategy__recent-empty-title'>
                    <Localize i18n_default_text='You do not have any recent bots' />
                </div>
                <div className='load-strategy__recent-empty-description'>
                    <Localize i18n_default_text='Create one or upload one from your local drive or Google Drive.' />
                </div>
                <div className='load-strategy__recent-empty-expand' onClick={toggleExplanationExpand}>
                    <Localize i18n_default_text="Why can't I see my recent bots?" />
                </div>
                <div
                    className={classnames('load-strategy__recent-empty-explanation', {
                        'load-strategy__recent-empty-explanation--show': is_explanation_expand,
                    })}
                >
                    <div>
                        <Localize i18n_default_text="If you've recently used bots but don't see them in this list, it may be because you:" />
                    </div>
                    <ol className='load-strategy__recent-empty-explanation-list'>
                        {explanation_list.map(content => {
                            return (
                                <li key={content}>
                                    <Localize i18n_default_text={content} />
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </div>
    );
};

const Recent = connect(({ load_modal }: RootStore) => ({
    is_explanation_expand: load_modal.is_explanation_expand,
    recent_strategies: load_modal.recent_strategies,
    toggleExplanationExpand: load_modal.toggleExplanationExpand,
    is_delete_modal_open: load_modal.is_delete_modal_open,
    toggleStrategies: load_modal.toggleStrategies,
}))(RecentComponent);

export default Recent;
