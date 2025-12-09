import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("", "routes/_main/_layout.tsx", [index("routes/_main/home.tsx")]),

  route("dashboard", "routes/dashboard/_layout.tsx", [
    index("routes/dashboard/index.tsx"),
    route("profile", "routes/dashboard/profile.tsx"),

    route("aws", "routes/dashboard/aws/_layout.tsx", [
      route("connect", "routes/dashboard/aws/connect.tsx"),

      route("accounts", "routes/dashboard/aws/accounts/_layout.tsx", [
        route(
          ":accountId",
          "routes/dashboard/aws/accounts/$accountId/_layout.tsx",
          [
            // 👇 index route for account page
            index("routes/dashboard/aws/accounts/$accountId/index.tsx"),

            route(
              "services",
              "routes/dashboard/aws/accounts/$accountId/services/_layout.tsx",
              [
                route(
                  ":serviceId",
                  "routes/dashboard/aws/accounts/$accountId/services/$serviceId.tsx"
                ),
              ]
            ),
          ]
        ),
      ]),
    ]),
  ]),

  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("verify-email", "routes/verify.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
