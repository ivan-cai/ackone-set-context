# Setting context for Kubernetes cluster of Alibaba Cloud Kubernetes Service (ACK)
Use this GitHub Action to [set context for Kubernetes cluster of Alibaba Distributed Cloud Container Platform for Kubernetes (ACK One)](https://www.aliyun.com/product/aliware/adcp?spm=5176.181001.J_4VYgf18xNlTAyFFbOuOQe.154.16424e26BYrJoe). 


Set the ```KUBECONFIG``` environment variable by ACK One cluster id.


```yaml
- uses: ivan-cai/ackone-set-context@v1
  with:
    access-key-id: '<access key id>'
    access-key-secret: '<access key secret>'
    cluster-id: '<cluster id>'
```

Refer to the action metadata file for details about all the inputs: [action.yml](https://github.com/ivan-cai/ackone-set-context/blob/main/action.yml)

### Prerequisite
Get the access-key-id and access-key-secret of Alibaba Cloud and add them as as [secrets](https://developer.github.com/actions/managing-workflows/storing-secrets/) in the GitHub repository.

