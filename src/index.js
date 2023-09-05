
const core = require('@actions/core');
const path = require('path');
const fs = require('fs');
const popCOre = require('@alicloud/pop-core');

const APIEndpoint = 'https://adcp.aliyuncs.com'


async function run() {
    let accessKeyId = core.getInput('access-key-id', { required: true });
    let accessKeySecret = core.getInput('access-key-secret', { required: true });
    let securityToken = core.getInput('security-token', { required: false });
    let clusterId = core.getInput('cluster-id', { required: false });

    try {
        let client = new popCOre({
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
            securityToken: securityToken,
            endpoint: APIEndpoint,
            apiVersion: '2022-01-01'
        });

        let params = {
            ClusterId: clusterId,
        }
        let requestOption = {
            method: 'POST',
            formatParams: false,
        };

        let result = await requestWithRetry(client, 'DescribeHubClusterKubeconfig', params, requestOption)
        let kubeconfig = result.Kubeconfig
        const runnerTempDirectory = process.env['RUNNER_TEMP']; // Using process.env until the core libs are updated
        const kubeconfigPath = path.join(runnerTempDirectory, `kubeconfig_${Date.now()}`);
        core.debug(`Writing kubeconfig contents to ${kubeconfigPath}`);
        fs.writeFileSync(kubeconfigPath, kubeconfig);
        fs.chmodSync(kubeconfigPath, '600');
        core.exportVariable('KUBECONFIG', kubeconfigPath);
        console.log('KUBECONFIG environment variable is set');
    } catch (err) {
        core.setFailed(`Failed to get kubeconfig file for ACK One cluster: ${err}`);
    }

}

async function requestWithRetry(client, action, params, requestOption, retries = 3, retryDelay = 1000) {
    try {
        return await client.request(action, params, requestOption);
    } catch (err) {
        if (retries > 0) {
            core.info(`Retrying after ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return await requestWithRetry(client, action, params, requestOption,retries - 1, retryDelay * 2);
        } else {
            throw err;
        }
    }
}

run();