import type { NS } from '../../NetscriptDefinitions';

export function main(ns: NS) {
  // -=- Variables -=-
  const tailWindows: { [key: string]: HTMLElement } = {};

  // -=- Mutation Observers -=-
  // ~ Tail window mutation observer
  // = Create a mutation observer to watch for new tail windows
  const rootObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const { addedNodes, removedNodes } = mutation;

      // TODO:EROXL: (2022-12-30) Parse new tail windows
    });
  });

  // = If the root element doesn't exist, return
  if (!document.getElementById('root')) return;

  // = Observe the root element for child list mutations
  rootObserver.observe(document.getElementById('root')!, {
    childList: true,
  });

  // ~ Tail window mutation observer
  // = Create a mutation observer to watch for new text in tail windows
  const tailObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const { addedNodes, removedNodes } = mutation;

      // TODO:EROXL: (2022-12-30) Parse tail window text
    });
  });

  // = Watch the main terminal for new text
  // = Check if the main terminal exists
  if (!document.getElementById('terminal')) return;

  // = Observe the main terminal for child list mutations
  tailObserver.observe(document.getElementById('terminal')!, {
    childList: true,
  });

  // -=- Cleanup -=-
  ns.atExit(() => {
    // ~ Disconnect the mutation observers
    rootObserver.disconnect();
    tailObserver.disconnect();
  })
}
