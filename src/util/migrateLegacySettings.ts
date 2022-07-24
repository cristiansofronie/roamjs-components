import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import { OnloadArgs, RoamBasicNode } from "../types/native";
import deleteBlock from "../writes/deleteBlock";
import toConfigPageName from "./toConfigPageName";

const migrateLegacySettings = ({
  extensionId,
  extensionAPI,
  specialKeys = {},
}: Pick<OnloadArgs, "extensionAPI"> & {
  extensionId: string;
  specialKeys?: Record<string, (n: RoamBasicNode) => unknown>;
}) => {
  const page = toConfigPageName(extensionId);
  const uid = getPageUidByPageTitle(page);
  const tree = getBasicTreeByParentUid(uid);
  tree
    .map((c) => {
      if (specialKeys[c.text]) {
        return {
          key: c.text,
          value: specialKeys[c.text](c),
          attributeConfig: false,
          uid: c.uid,
        };
      } else if (/^[\w\s]+::.+$/.test(c.text)) {
        const [key, value] = c.text.split("::").map((k) => k.trim());
        return { key, value, attributeConfig: true, uid: c.uid };
      } else {
        return {
          key: c.text,
          value: c.children[0]?.text || true,
          attributeConfig: false,
          uid: c.uid,
        };
      }
    })
    .filter(
      (c) =>
        process.env.ROAM_MARKETPLACE === "true" ||
        process.env.ROAM_DEPOT === "true" ||
        c.attributeConfig
    )
    .forEach((c) =>
      deleteBlock(c.uid).then(() =>
        extensionAPI.settings.set(
          c.key.replace(/ /, "-").toLowerCase(),
          c.value
        )
      )
    );
};

export default migrateLegacySettings;