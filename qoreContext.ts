import { ProjectSchema, QoreClient } from "@feedloop/qore-client";
import createQoreContext from "@feedloop/qore-react";
import Cookies from "js-cookie";
import config from "./qore.config.json";
import schema from "./qore.schema.json";

export const client = new QoreClient<ProjectSchema>({
  ...config,
  getToken: () => Cookies.get("token"),
  onError: (error) => {
    switch (error.message) {
      case "Request failed with status code 401":
        if (
          window.location.pathname !== "/login" &&
          process.env.NODE_ENV === "production"
        ) {
          window.location.href = "/login";
        }
        break;

      default:
        break;
    }
  },
});
client.init(schema as any);

const qoreContext = createQoreContext(client);
export default qoreContext;
