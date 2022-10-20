import React from 'react';
import RootStore from 'Stores/index';
import AppStore from 'Stores/app-store';
import { connect } from 'Stores/connect';
import ReactJoyride from 'react-joyride';
import classNames from 'classnames';
import WorkspaceWrapper from './workspace-wrapper';
import { BOT_BUILDER_TOUR } from '../joyride-config';

type TBotBuilder = {
    app: AppStore;
    active_tab: number;
};

const BotBuilder = ({ app, active_tab }: TBotBuilder) => {
    const { onMount, onUnmount } = app;

    React.useEffect(() => {
        onMount();
        return () => onUnmount();
    }, []);

    // TODO: temporary method, we should remove these
    // just for reference
    // below it explains how we can make the block center for mobile onboarding tours.
    const makeCenter = (type: string) => {
        const blocks: { [k: string]: any } = {};
        Blockly?.derivWorkspace?.getTopBlocks().forEach(b => {
            blocks[b.type] = b.id;
        });
        Blockly.derivWorkspace.centerOnBlock(blocks[type]);
    };

    return (
        <>
            <div className={classNames('bot-builder', { 'bot-builder--active': active_tab === 1 })}>
                <div
                    id='scratch_div'
                    style={{
                        width: 'calc(100vw - 3.2rem)',
                        height: 'var(--bot-content-height)',
                    }}
                >
                    <WorkspaceWrapper />
                    {active_tab === 1 && (
                        <ReactJoyride
                            steps={BOT_BUILDER_TOUR}
                            continuous={true}
                            showProgress={true}
                            styles={{
                                options: {
                                    arrowColor: 'var(--text-general)',
                                    backgroundColor: 'var(--text-general)',
                                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                                    primaryColor: 'var(--brand-red-coral)',
                                    textColor: 'var(--text-colored-background)',
                                    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
                                },
                            }}
                        />
                    )}
                </div>
                {/* TODO: temporary elements just for reference  */}
                <div className='temp-buttons'>
                    <button onClick={() => makeCenter('trade_definition')}>trade</button>
                    <button onClick={() => makeCenter('before_purchase')}>purchase</button>
                    <button onClick={() => makeCenter('during_purchase')}>sell</button>
                    <button onClick={() => makeCenter('after_purchase')}>restart</button>
                </div>
            </div>
        </>
    );
};

export default connect((store: RootStore) => ({
    app: store.app,
    active_tab: store.dashboard.active_tab,
}))(BotBuilder);
