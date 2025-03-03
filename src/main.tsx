import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import "./index.css";
import App from "./App.tsx";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );

const VIEW_TYPE_HOURS = "hours-view";

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE_HOURS, (leaf) => new HoursView(leaf));

    this.addRibbonIcon("dice", "Activate view", () => {
      this.activateView();
    });
  }

  async onunload() {}

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_HOURS);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false);
      await leaf?.setViewState({ type: VIEW_TYPE_HOURS, active: true });
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if (leaf) workspace.revealLeaf(leaf);
  }
}

class HoursView extends ItemView {
  root: Root | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_HOURS;
  }

  getDisplayText() {
    return "Working Hours";
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <StrictMode>
        <App />,
      </StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
