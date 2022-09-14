const core = require('@actions/core');

const path = require('path');
const fs = require('fs');
const ROAClient = require('@alicloud/pop-core').ROAClient;


const APIEndpoint = `https://cs.aliyuncs.com`

async function run() {
    let accessKeyId = core.getInput('access-key-id', { required: false });
    let accessKeySecret = core.getInput('access-key-secret', { required: false });
    let clusterId = core.getInput('cluster-id', { required: false });

    try {
        let client = new ROAClient({
            accessKeyId,
            accessKeySecret,
            endpoint: APIEndpoint,
            apiVersion: '2015-12-15'
        });
        let result = await client.request('GET', `/k8s/${clusterId}/user_config`)
        let kubeconfig = result.config
        const workspace = process.env.GITHUB_WORKSPACE;
        const kubeconfigPath = path.join(workspace, `kubeconfig_${Date.now()}`);
        core.debug(`Writing kubeconfig contents to ${kubeconfigPath}`);
        fs.writeFileSync(kubeconfigPath, kubeconfig);
        fs.chmodSync(kubeconfigPath, '600');
        core.exportVariable('KUBECONFIG', kubeconfigPath);
        console.log('KUBECONFIG environment variable is set at ${kubeconfigPath}');
    } catch (err) {
        core.setFailed(`Failed to get kubeconfig file for Kubernetes cluster: ${err}`);
    }
}
run();
