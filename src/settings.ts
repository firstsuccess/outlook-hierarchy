export interface FileRef {
  driveId: string;
  itemId: string;
  webUrl: string;
}
export interface SettingsStore {
  get(): FileRef | undefined;
  save(ref: FileRef | undefined): Promise<void>;
}
export const settingKey = "hierarchyAddressBook.file.v1";
export function createSettingsStore(
  settings: Office.RoamingSettings,
): SettingsStore {
  return {
    get() {
      const v = settings.get(settingKey);
      return v &&
        typeof v.driveId === "string" &&
        typeof v.itemId === "string" &&
        typeof v.webUrl === "string"
        ? { driveId: v.driveId, itemId: v.itemId, webUrl: v.webUrl }
        : undefined;
    },
    save(ref) {
      const old = settings.get(settingKey);
      if (ref)
        settings.set(settingKey, {
          driveId: ref.driveId,
          itemId: ref.itemId,
          webUrl: ref.webUrl,
        });
      else settings.remove(settingKey);
      return new Promise((resolve, reject) =>
        settings.saveAsync((r) => {
          if (r.status === Office.AsyncResultStatus.Succeeded) resolve();
          else {
            if (old === undefined) settings.remove(settingKey);
            else settings.set(settingKey, old);
            reject(Error(r.error.message));
          }
        }),
      );
    },
  };
}
