import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { LabIcon } from '@jupyterlab/ui-components';
import { ICommandPalette } from '@jupyterlab/apputils';
import { nullTranslator } from '@jupyterlab/translation';
import { KernelUsagePanel } from './panel';
import tachometer from '../style/tachometer.svg';

import { IStatusBar } from '@jupyterlab/statusbar';

import { ITranslator } from '@jupyterlab/translation';

import { MemoryUsage } from './memoryUsage';

namespace CommandIDs {
  export const getKernelUsage = 'kernel-usage:get';
}

/**
 * Initialization data for the jupyter-resource-usage extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@jupyter-server/resource-usage:memory-kernel-status-item',
  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    statusBar: IStatusBar | null,
    translator: ITranslator | null,
    palette: ICommandPalette | null,
    notebookTracker: INotebookTracker | null
  ) => {
    translator = translator || nullTranslator;
    const trans = translator.load('jupyterlab');
    const item = new MemoryUsage(translator);

    if (statusBar) {
      statusBar.registerStatusItem(extension.id, {
        item,
        align: 'left',
        rank: 2,
        isActive: () => item.model.metricsAvailable,
        activeStateChanged: item.model.stateChanged,
      });
    }

    const { commands, shell } = app;
    const category = 'Kernel Resource';

    let panel: KernelUsagePanel | null = null;

    function createPanel() {
      if ((!panel || panel.isDisposed) && notebookTracker) {
        panel = new KernelUsagePanel({
          widgetAdded: notebookTracker.widgetAdded,
          currentNotebookChanged: notebookTracker.currentChanged,
        });
        shell.add(panel, 'right', { rank: 200 });
      }
    }

    commands.addCommand(CommandIDs.getKernelUsage, {
      label: trans.__('Kernel Usage'),
      caption: trans.__('Kernel Usage'),
      icon: new LabIcon({
        name: 'jupyterlab-kernel-usage:icon',
        svgstr: tachometer,
      }),
      execute: createPanel,
    });

    if (palette) {
      palette.addItem({ command: CommandIDs.getKernelUsage, category });
    }

    createPanel();
  },
};

export default extension;
