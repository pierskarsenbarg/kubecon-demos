import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface ApplicationArgs {
  appName: string;
  image: string;
  containerPort: number;
  hostName: string;
}

export class Application extends pulumi.ComponentResource {
  constructor(name: string, args: ApplicationArgs, opts?: pulumi.ComponentResourceOptions) {
    super("x:index:Application", name, {name, args, opts}, opts);

    this.getData();
  }

  protected async initialize(props: {
    name: string;
    args: ApplicationArgs;
    opts: pulumi.ComponentResourceOptions;
  }) {
    const {name, args} = props;
    const appLabel = { app: args.appName };

    const namespace = new k8s.core.v1.Namespace(`${args.appName}-namespace`, {}, {parent: this});

    const deployment = new k8s.apps.v1.Deployment(`${args.appName}-deployment`, {
      metadata: {
        namespace: namespace.metadata.name,
      },
      spec: {
        selector: {
          matchLabels: appLabel,
        },
        template: {
          metadata: { labels: appLabel },
          spec: {
            containers: [
              {
                name: args.appName,
                image: args.image,
                ports: [
                  {
                    containerPort: args.containerPort,
                  },
                ],
              },
            ],
          },
        },
      },
    }, {parent: this});

    const service = new k8s.core.v1.Service(`${args.appName}-service`, {
      metadata: {
        namespace: namespace.metadata.name,
      },
      spec: {
        selector: appLabel,
        ports: [
          {
            port: 8080, // doesn't matter because we're using kind
            targetPort: args.containerPort,
            name: "http-port",
          },
        ],
      },
    }, {parent: this, dependsOn: deployment});

    const ingress = new k8s.networking.v1.Ingress(`${args.appName}-ingress`, {
      metadata: {
        namespace: namespace.metadata.name,
      },
      spec: {
        rules: [
          {
            host: args.hostName,
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: service.metadata.name,
                      port: {
                        name: "http-port",
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    }, {parent: this});
  }
}
