import { useEffect } from "react";

export const useNoIndex = () => {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";

    return () => {
      if (meta) meta.remove();
    };
  }, []);
};
