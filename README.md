# Off-line Kubernetes Demo

## Pre-requisite installed

- Pulumi CLI - https://www.pulumi.com/docs/install/
- Docker - https://www.docker.com/products/docker-desktop/
- Kind - https://kind.sigs.k8s.io/docs/user/quick-start/#installing-with-a-package-manager
- Kubectl - https://kubernetes.io/docs/tasks/tools/

## Set up

You'll want to do this in advance.

### Create cluster

You're going to create a cluster with one control plane and two worker nodes as detailed in [kindConfig.yaml](./kindConfig.yaml):

`kind create cluster --config=kindConfig.yaml`

Once that's finished, you can get the kubeconfig by running:

`kind get kubeconfig` 

(I also write it to `~/.kube/config` because it makes my life easier)

### Install nginx ingress

Next we install the nginx ingress controller for Kind:

`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml`

If you want to check that this is running, you can run the following:

```
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### Pre-load docker images

The demos in this repo use a "hello-world" image that is hosted here: https://hub.docker.com/r/pierskarsenbarg/hello-world-app 

You don't have to use it, but then you'll need to update the code inside. 

Whatever image you want to use, you should pre-load it into the cluster by running the following command:

`docker pull {image} && kind load docker-image {image}`

(so for the hello world app, it's `docker pull pierskarsenbarg/hello-world-app && kind load docker-image pierskarsenbarg/hello-world-app`)

