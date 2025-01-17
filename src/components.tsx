import ReactDOM from "react-dom";
import React, { useState, useMemo } from "react";
import { Button } from "@blueprintjs/core";

import AutocompleteInput from "./components/AutocompleteInput";
import FormDialog from "./components/FormDialog";
import PageInput from "./components/PageInput";
import renderToast from "./components/Toast";

import renderOverlay from "./util/renderOverlay";
import runExtension from "./util/runExtension";

import { createBlock } from "./writes";

// const blockRender = (Component: React.FC) => {
//   const block = window.roamAlphaAPI.ui.getFocusedBlock();
//   const parent = document.getElementById(
//     `block-input-${block?.["window-id"]}-${block?.["block-uid"]}`
//   );
//   ReactDOM.render(<Component />, parent);
// };

const unloads = new Set<() => void>();

const rootRender = (Component: React.FC) => {
  const root = document.querySelector(".roam-article");
  const parent = document.createElement("div");
  root?.insertBefore(parent, root.firstElementChild);
  ReactDOM.render(<Component />, parent);
  unloads.add(() => {
    ReactDOM.unmountComponentAtNode(parent);
    parent.remove();
  });
};

const components = [
  {
    callback: () =>
      rootRender(() => {
        const [value, setValue] = useState("");
        const options = useMemo(() => ["apple", "banana", "orange"], []);
        return (
          <>
            <AutocompleteInput
              value={value}
              setValue={setValue}
              options={options}
            />
            <div>Chosen value: {value}</div>
          </>
        );
      }),
    label: "AutocompleteInput",
  },
  {
    callback: () =>
      rootRender(() => {
        const [isOpen, setIsOpen] = useState(false);
        return (
          <>
            <Button onClick={() => setIsOpen(true)} text={"Open Form"} />
            <FormDialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              onSubmit={(data) =>
                window.roamAlphaAPI.ui.mainWindow
                  .getOpenPageOrBlockUid()
                  .then((parentUid) =>
                    createBlock({
                      parentUid:
                        parentUid ||
                        window.roamAlphaAPI.util.dateToPageUid(new Date()),
                      node: {
                        text: "Response",
                        children: Object.entries(data).map(([k, v]) => ({
                          text: k,
                          children: Array.isArray(v) ? v : [{ text: `${v}` }],
                        })),
                      },
                    })
                  )
              }
              fields={{
                text: { type: "text", label: "Text Field" },
                number: { type: "number", label: "Number Field" },
                info: { type: "info", label: "Read Only Info Text" },
                flag: { type: "flag", label: "Flag Field" },
                conditionalText: {
                  type: "text",
                  label: "Conditional Text Field",
                  conditional: "flag",
                },
                page: { type: "page", label: "Page Field" },
                block: { type: "block", label: "Block Field" },
                select: {
                  type: "select",
                  label: "Select Field",
                  options: [
                    "apple",
                    "banana",
                    "orange",
                    "conditional select 1",
                  ],
                },
                conditionalSelect: {
                  type: "text",
                  label: "Conditional Text Field",
                  conditional: "select",
                  conditionalValues: ["conditional select 1"],
                },
                autocomplete: {
                  type: "autocomplete",
                  label: "Autocomplete Field",
                  options: ["apple", "banana", "orange"],
                },
                embed: {
                  type: "embed",
                  label: "Embed Field",
                },
              }}
            />
          </>
        );
      }),
    label: "FormDialog",
  },
  {
    callback: () =>
      rootRender(() => {
        const [value, setValue] = useState("");
        const [multiline, setMultiline] = useState(false);
        return (
          <>
            <PageInput
              value={value}
              setValue={setValue}
              multiline={multiline}
            />
            <input
              className="ml-8 inline-block"
              checked={multiline}
              onChange={(e) => setMultiline(e.target.checked)}
              type={"checkbox"}
            />
          </>
        );
      }),
    label: "PageInput",
  },
];

export default runExtension(async (args) => {
  components.forEach(({ callback, label }) => {
    args.extensionAPI.ui.commandPalette.addCommand({
      label: `Render RoamJS component ${label}`,
      callback,
    });
  });
  window.roamjs.extension.developer = {
    components: {
      AutocompleteInput,
      FormDialog,
      PageInput,
      renderToast,
    },
    util: {
      renderOverlay,
      runExtension,
    },
    args,
  };
  return () => {
    unloads.forEach((unload) => unload());
  };
});
