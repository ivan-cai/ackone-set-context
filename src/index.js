
import adcp20220101, * as $adcp20220101 from '@alicloud/adcp20220101';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import * as path from "path";
import * as fs from "fs";

import core from '@actions/core';

const APIEndpoint = `https://adcp.aliyuncs.com`

export default class Client {
    /**
     * 使用AK&SK初始化账号Client
     * @param accessKeyId
     * @param accessKeySecret
     * @param securityToken
     * @return Client
     * @throws Exception
     */
    static createClient(accessKeyId: string, accessKeySecret: string, securityToken: string): adcp20220101 {
        let config = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: accessKeyId,
            // 必填，您的 AccessKey Secret
            accessKeySecret: accessKeySecret,
            securityToken: securityToken,
        });
        // Endpoint 请参考 https://api.aliyun.com/product/adcp
        config.endpoint = `adcp.cn-hangzhou.aliyuncs.com`;
        return new adcp20220101(config);
    }

    static async main(args: string[]): Promise<void> {
        let accessKeyId = core.getInput('access-key-id', { required: true });
        let accessKeySecret = core.getInput('access-key-secret', { required: true });
        let securityToken = core.getInput('security-token', { required: false });
        let clusterId = core.getInput('cluster-id', { required: false });

        let client = Client.createClient(accessKeyId, accessKeySecret, securityToken);

        let describeHubClusterKubeconfigRequest = new $adcp20220101.DescribeHubClusterKubeconfigRequest({
            clusterId: clusterId
        });
        let runtime = new $Util.RuntimeOptions({ });
        try {
            let result = await client.describeHubClusterKubeconfigWithOptions(describeHubClusterKubeconfigRequest, runtime);
            let kubeconfig = result.body.kubeconfig
            const runnerTempDirectory = process.env['RUNNER_TEMP']; // Using process.env until the core libs are updated
            const kubeconfigPath = path.join(runnerTempDirectory, `kubeconfig_${Date.now()}`);
            core.debug(`Writing kubeconfig contents to ${kubeconfigPath}`);
            fs.writeFileSync(kubeconfigPath, kubeconfig);
            fs.chmodSync(kubeconfigPath, '600');
            core.exportVariable('KUBECONFIG', kubeconfigPath);
            console.log('KUBECONFIG environment variable is set');
        } catch (error) {
            core.setFailed(`Failed to get kubeconfig file for ACK One cluster: ${err}`);
        }
    }
}

async function run(){
    await Client.main(process.argv.slice(2))
}