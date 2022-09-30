import React from 'react';
import { Icon, Dialog } from '@deriv/components';
import { Localize, localize } from '@deriv/translations';
import LoadModal from 'Components/load-modal';
import SaveModal from 'Components/save-modal';
import { tabs_title } from 'Constants/bot-contents';
import { connect } from 'Stores/connect';
import RootStore from 'Stores/index';
import ToolbarButton from './toolbar-button';
import WorkspaceGroup from './workspace-group';

type TToolbar = {
    active_tab: string;
    file_name: string;
    has_redo_stack: boolean;
    has_undo_stack: boolean;
    is_dialog_open: boolean;
    is_drawer_open: boolean;
    is_running: boolean;
    is_stop_button_disabled: boolean;
    is_stop_button_visible: boolean;
    closeResetDialog: () => void;
    onOkButtonClick: () => void;
    onResetClick: () => void;
    onRunButtonClick: () => void;
    onSortClick: () => void;
    onUndoClick: () => void;
    onZoomInOutClick: () => void;
    toggleSaveLoadModal: () => void;
    is_mobile: boolean;
    toggleStrategyModal: () => void;
    toggleLoadModal: () => void;
    toggleSaveModal: () => void;
};

const Toolbar = (props: TToolbar) => {
    const {
        is_mobile,
        is_running,
        active_tab,
        is_dialog_open,
        onOkButtonClick,
        closeResetDialog,
        toggleStrategyModal,
        toggleLoadModal,
        toggleSaveModal,
    } = props;

    return (
        <>
            {is_mobile ? (
                <div className='toolbar'>
                    <div className='toolbar__section'>
                        <ToolbarButton
                            button_id='db-toolbar__import-button--mobile'
                            button_classname='toolbar__btn--icon'
                            buttonOnClick={toggleLoadModal}
                            icon={<Icon icon='IcFolderOpenFilled' color='active' />}
                            button_text={localize('Load')}
                        />
                        <ToolbarButton
                            button_id='db-toolbar__quick-strategy-button--mobile'
                            button_classname='toolbar__btn--icon'
                            buttonOnClick={toggleStrategyModal}
                            icon={<Icon icon='IcPuzzle' color='active' />}
                            button_text={localize('Quick')}
                        />
                        <ToolbarButton
                            button_id='db-toolbar__save-button--mobile'
                            button_classname='toolbar__btn--icon'
                            buttonOnClick={toggleSaveModal}
                            icon={<Icon icon='IcSaveFilled' color='active' />}
                            button_text={localize('Save')}
                        />
                    </div>
                </div>
            ) : (
                <div className='toolbar dashboard__toolbar'>
                    <div className='toolbar__section'>
                        {active_tab === tabs_title.WORKSPACE && <WorkspaceGroup {...props} />}
                    </div>
                </div>
            )}
            <SaveModal />
            <LoadModal />
            <Dialog
                portal_element_id='modal_root'
                title={localize('Are you sure?')}
                is_visible={is_dialog_open}
                confirm_button_text={is_running ? localize('Yes') : localize('OK')}
                onConfirm={onOkButtonClick}
                cancel_button_text={is_running ? localize('No') : localize('Cancel')}
                onCancel={closeResetDialog}
                is_mobile_full_width={false}
                className={'toolbar__dialog dc-dialog__wrapper--fixed'}
                has_close_icon
            >
                {is_running ? (
                    <Localize
                        i18n_default_text='DBot will not proceed with any new trades. Any ongoing trades will be completed by our system. Any unsaved changes will be lost.<0>Note: Please check your statement to view completed transactions.</0>'
                        components={[<div key={0} className='toolbar__dialog-text--second' />]}
                    />
                ) : (
                    localize('Any unsaved changes will be lost.')
                )}
            </Dialog>
        </>
    );
};

export default connect(
    ({ main_content, run_panel, save_modal, load_modal, toolbar, ui, quick_strategy }: RootStore) => ({
        active_tab: main_content.active_tab,
        file_name: toolbar.file_name,
        has_redo_stack: toolbar.has_redo_stack,
        has_undo_stack: toolbar.has_undo_stack,
        is_dialog_open: toolbar.is_dialog_open,
        is_drawer_open: run_panel.is_drawer_open,
        is_mobile: ui.is_mobile,
        is_running: run_panel.is_running,
        is_stop_button_disabled: run_panel.is_stop_button_disabled,
        is_stop_button_visible: run_panel.is_stop_button_visible,
        closeResetDialog: toolbar.closeResetDialog,
        onOkButtonClick: toolbar.onResetOkButtonClick,
        onResetClick: toolbar.onResetClick,
        onRunButtonClick: run_panel.onRunButtonClick,
        onSortClick: toolbar.onSortClick,
        onUndoClick: toolbar.onUndoClick,
        onZoomInOutClick: toolbar.onZoomInOutClick,
        toggleLoadModal: load_modal.toggleLoadModal,
        toggleSaveModal: save_modal.toggleSaveModal,
        toggleStrategyModal: quick_strategy.toggleStrategyModal,
    })
)(Toolbar);
