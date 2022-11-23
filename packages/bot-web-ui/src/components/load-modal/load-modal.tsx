import React from 'react';
import { Modal, Tabs, MobileFullPageModal } from '@deriv/components';
import { localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import { tabs_title } from 'Constants/load-modal';
import RootStore from 'Stores/root-store';
import GoogleDrive from './google-drive';
import Local from './local';
import Recent from './recent';
import RecentFooter from './recent-footer';

type TLoadModalProps = {
    active_index: number;
    is_load_modal_open: boolean;
    is_mobile: boolean;
    loaded_local_file: string;
    onEntered: () => void;
    recent_strategies: any[];
    setActiveTabIndex: () => void;
    setPreviewOnPopup: (show: boolean) => void;
    tab_name: string;
    toggleLoadModal: () => void;
};

const LoadModal = ({
    active_index,
    is_load_modal_open,
    is_mobile,
    loaded_local_file,
    onEntered,
    recent_strategies,
    setActiveTabIndex,
    setPreviewOnPopup,
    tab_name,
    toggleLoadModal,
}: TLoadModalProps) => {
    const header_text = localize('Load strategy');

    if (is_mobile) {
        return (
            <MobileFullPageModal
                is_modal_open={is_load_modal_open}
                className='load-strategy__wrapper'
                header={localize('Load strategy')}
                onClickClose={() => {
                    setPreviewOnPopup(false);
                    toggleLoadModal();
                }}
                height_offset='80px'
                page_overlay
            >
                <Tabs active_index={active_index} onTabItemClick={setActiveTabIndex} top>
                    <div label={localize('Local')}>
                        <Local />
                    </div>
                    <div label='Google Drive'>
                        <GoogleDrive />
                    </div>
                </Tabs>
            </MobileFullPageModal>
        );
    }

    const has_loaded_file = loaded_local_file && tab_name === tabs_title.TAB_LOCAL;
    const has_recent_strategies = recent_strategies.length > 0 && tab_name === tabs_title.TAB_RECENT;

    return (
        <Modal
            title={header_text}
            className='load-strategy'
            width='1000px'
            height='80vh'
            is_open={is_load_modal_open}
            toggleModal={toggleLoadModal}
            onEntered={onEntered}
            elements_to_ignore={[document.querySelector('.injectionDiv')]}
        >
            <Modal.Body>
                <Tabs active_index={active_index} onTabItemClick={setActiveTabIndex} top header_fit_content>
                    <div label={localize('Recent')}>
                        <Recent />
                    </div>
                    <div label={localize('Local')}>
                        <Local />
                    </div>
                    <div label='Google Drive'>
                        <GoogleDrive />
                    </div>
                </Tabs>
            </Modal.Body>
            {(has_recent_strategies || has_loaded_file) && (
                <Modal.Footer has_separator>
                    <RecentFooter />
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default connect(({ load_modal, ui, dashboard }: RootStore) => ({
    active_index: load_modal.active_index,
    is_load_modal_open: load_modal.is_load_modal_open,
    is_mobile: ui.is_mobile,
    loaded_local_file: load_modal.loaded_local_file,
    onEntered: load_modal.onEntered,
    recent_strategies: load_modal.recent_strategies,
    setActiveTabIndex: load_modal.setActiveTabIndex,
    tab_name: load_modal.tab_name,
    toggleLoadModal: load_modal.toggleLoadModal,
    setPreviewOnPopup: dashboard.setPreviewOnPopup,
}))(LoadModal);
