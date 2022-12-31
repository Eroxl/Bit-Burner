import type { NS } from '../../NetscriptDefinitions';

// General Example: <!-- id: "1234567890", data: {  } -->
const acceptedRegex = /<!-- ("\S+":".+",?) -->/g;

export function main(ns: NS) {
  // -=- Variables -=-
  const elements: Record<string, HTMLElement> = {};

  // -=- Mutation Observers -=-

  // ~ Tail window mutation observer
  // = Create a mutation observer to watch for new text in tail windows
  const tailObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const { addedNodes, removedNodes } = mutation;

      // TODO:EROXL: (2022-12-30) Parse tail window text
      addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        // = Check if the node has text
        if (!node.textContent) return;

        // = Check if the acceptedRegex matches the text
        const matches = node.textContent.match(acceptedRegex);

        // = If there are no matches, return
        if (!matches) return;
      })
    });
  });

  // = Watch the main terminal for new text
  // = Check if the main terminal exists
  if (!document.getElementById('terminal')) return;

  // = Observe the main terminal for child list mutations
  tailObserver.observe(document.getElementById('terminal')!, {
    childList: true,
  });
 
  // ~ Tail window mutation observer
  // = Create a mutation observer to watch for new tail windows
  const rootObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const { addedNodes } = mutation;

      // = Check for new tail windows
      addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        // = Get the tail window resize component
        const base = node.getElementsByClassName('react-resizable')[0];

        // = If the node doesn't have a resize component, return
        if (!base) return;

        // = If the node doesn't have a tail window, return
        if (!base.getElementsByTagName('div')[1].getElementsByTagName('span').length) return;
        
        const tailWindowOutputArea = base.getElementsByTagName('div')[1].getElementsByTagName('span')[0];

        // = Start watching for new text in the tail window
        tailObserver.observe(tailWindowOutputArea, {
          childList: true,
        });
      });
    });
  });

  // = If the root element doesn't exist, return
  if (!document.getElementById('root')) return;

  // = Observe the root element for child list mutations
  rootObserver.observe(document.getElementById('root')!, {
    childList: true,
  });

  // -=- Cleanup -=-
  ns.atExit(() => {
    // ~ Disconnect the mutation observers
    rootObserver.disconnect();
    tailObserver.disconnect();
  })
}
